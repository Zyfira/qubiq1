
package com.qubiq.service;

import com.qubiq.entity.Role;
import com.qubiq.entity.User;
import com.qubiq.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CurrentUser {

    private final UserRepository users;

    public CurrentUser(UserRepository users) {
        this.users = users;
    }

    public User get() {

        String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

        return users.findByEmail(email)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User account not found."
                )
            );
    }

    public void requireApprovedTeacher() {

        User user = get();

        if (user.getRole() != Role.TEACHER
                && user.getRole() != Role.ADMIN) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Teacher access required."
            );
        }
    }
}
