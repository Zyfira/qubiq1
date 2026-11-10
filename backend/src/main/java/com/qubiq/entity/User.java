package com.qubiq.entity;
import jakarta.persistence.*;import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="app_users") public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String name;
 @Column(nullable=false,unique=true) private String email;
 @JsonIgnore @Column(nullable=false) private String password;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role=Role.STUDENT;
 private boolean approved=true;
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getPassword(){return password;} public void setPassword(String v){password=v;}
 public Role getRole(){return role;} public void setRole(Role v){role=v;}
 public boolean isApproved(){return approved;} public void setApproved(boolean v){approved=v;}
}
