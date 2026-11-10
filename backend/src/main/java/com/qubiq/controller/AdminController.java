package com.qubiq.controller;
import com.qubiq.entity.*;import com.qubiq.repository.UserRepository;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/admin") public class AdminController {
 private final UserRepository users;public AdminController(UserRepository u){users=u;}
 private void admin(org.springframework.security.core.Authentication a){if(a==null||!a.getAuthorities().stream().anyMatch(x->x.getAuthority().equals("ROLE_ADMIN")))throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN);}
 @GetMapping("/pending-teachers") public List<Map<String,Object>> pending(org.springframework.security.core.Authentication a){admin(a);return users.findByRoleAndApprovedFalse(Role.TEACHER).stream().map(u->Map.<String,Object>of("id",u.getId(),"name",u.getName(),"email",u.getEmail())).toList();}
 @PatchMapping("/teachers/{id}/approve") public ResponseEntity<?> approve(@PathVariable Long id,org.springframework.security.core.Authentication a){admin(a);User u=users.findById(id).orElseThrow();if(u.getRole()!=Role.TEACHER)return ResponseEntity.badRequest().body(Map.of("message","Not a teacher account."));u.setApproved(true);users.save(u);return ResponseEntity.ok(Map.of("message","Teacher approved."));}
}
