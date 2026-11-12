
package com.qubiq.controller;

import com.qubiq.entity.*;
import com.qubiq.repository.UserRepository;
import com.qubiq.security.JwtService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(
            UserRepository users,
            PasswordEncoder encoder,
            JwtService jwt
    ) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    record Register(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8) String password,
        String role
    ) {}

    record Login(
        @Email @NotBlank String email,
        @NotBlank String password
    ) {}

    record UserView(
        Long id,
        String name,
        String email,
        String role,
        boolean approved
    ) {}

    record AuthResponse(
        String token,
        UserView user
    ) {}

    private UserView view(User user) {
        return new UserView(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.isApproved()
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody Register r
    ) {

        String email = r.email()
            .toLowerCase(Locale.ROOT)
            .trim();

        if (users.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Email already registered.")
            );
        }

        String requestedRole = r.role() == null
            ? "STUDENT"
            : r.role().toUpperCase(Locale.ROOT).trim();

        if (!requestedRole.equals("STUDENT")
                && !requestedRole.equals("TEACHER")) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Invalid account type.")
            );
        }

        Role role = Role.valueOf(requestedRole);

        User user = new User();
        user.setName(r.name().trim());
        user.setEmail(email);
        user.setPassword(encoder.encode(r.password()));
        user.setRole(role);

        // No admin approval required.
        user.setApproved(true);

        users.save(user);

        return ResponseEntity.ok(
            new AuthResponse(jwt.generate(user), view(user))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody Login r
    ) {

        String email = r.email()
            .toLowerCase(Locale.ROOT)
            .trim();

        User user = users.findByEmail(email).orElse(null);

        if (user == null
                || !encoder.matches(
                    r.password(),
                    user.getPassword()
                )) {
            return ResponseEntity.status(
                HttpStatus.UNAUTHORIZED
            ).body(
                Map.of("message", "Invalid email or password.")
            );
        }

        // Activate previously pending teacher accounts.
        if (user.getRole() == Role.TEACHER
                && !user.isApproved()) {
            user.setApproved(true);
            users.save(user);
        }

        return ResponseEntity.ok(
            new AuthResponse(jwt.generate(user), view(user))
        );
    }

    @GetMapping("/me")
    public UserView me(
            org.springframework.security.core.Authentication auth
    ) {
        User user = users.findByEmail(auth.getName())
            .orElseThrow();

        return view(user);
    }
}
