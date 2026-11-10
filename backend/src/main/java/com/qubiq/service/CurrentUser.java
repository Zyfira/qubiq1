package com.qubiq.service;
import com.qubiq.entity.*;import com.qubiq.repository.UserRepository;import org.springframework.security.core.context.SecurityContextHolder;import org.springframework.stereotype.Component;
@Component public class CurrentUser {
 private final UserRepository users;public CurrentUser(UserRepository u){users=u;}
 public User get(){String email=SecurityContextHolder.getContext().getAuthentication().getName();return users.findByEmail(email).orElseThrow();}
 public void requireApprovedTeacher(){User u=get();if(u.getRole()==Role.TEACHER&&!u.isApproved())throw new RuntimeException("Teacher account is awaiting admin approval.");if(u.getRole()!=Role.TEACHER&&u.getRole()!=Role.ADMIN)throw new RuntimeException("Teacher access required.");}
}
