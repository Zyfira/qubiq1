package com.qubiq.controller;
import com.qubiq.entity.*;import com.qubiq.repository.UserRepository;import com.qubiq.security.JwtService;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.http.*;import org.springframework.security.crypto.password.PasswordEncoder;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/auth") public class AuthController {
 private final UserRepository users;private final PasswordEncoder encoder;private final JwtService jwt;
 public AuthController(UserRepository u,PasswordEncoder e,JwtService j){users=u;encoder=e;jwt=j;}
 record Register(@NotBlank String name,@Email @NotBlank String email,@Size(min=8) String password,String role){}
 record Login(@Email String email,@NotBlank String password){}
 record UserView(Long id,String name,String email,String role,boolean approved){}
 record AuthResponse(String token,UserView user){}
 private UserView view(User u){return new UserView(u.getId(),u.getName(),u.getEmail(),u.getRole().name(),u.isApproved());}
 @PostMapping("/register") public ResponseEntity<?> register(@Valid @RequestBody Register r){
  String email=r.email().toLowerCase().trim();if(users.existsByEmail(email))return ResponseEntity.badRequest().body(Map.of("message","Email already registered."));
  Role role="TEACHER".equalsIgnoreCase(r.role())?Role.TEACHER:Role.STUDENT;
  User u=new User();u.setName(r.name());u.setEmail(email);u.setPassword(encoder.encode(r.password()));u.setRole(role);u.setApproved(role==Role.STUDENT);users.save(u);
  return ResponseEntity.ok(new AuthResponse(jwt.generate(u),view(u)));
 }
 @PostMapping("/login") public ResponseEntity<?> login(@Valid @RequestBody Login r){
  User u=users.findByEmail(r.email().toLowerCase().trim()).orElse(null);
  if(u==null||!encoder.matches(r.password(),u.getPassword()))return ResponseEntity.status(401).body(Map.of("message","Invalid email or password."));
  if(u.getRole()==Role.TEACHER&&!u.isApproved())return ResponseEntity.status(403).body(Map.of("message","Your teacher account is awaiting admin approval."));
  return ResponseEntity.ok(new AuthResponse(jwt.generate(u),view(u)));
 }
 @GetMapping("/me") public UserView me(org.springframework.security.core.Authentication a){User u=users.findByEmail(a.getName()).orElseThrow();return view(u);}
}
