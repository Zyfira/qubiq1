package com.qubiq;
import com.qubiq.entity.User;
import com.qubiq.entity.Role;
import com.qubiq.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
@SpringBootApplication
public class QubiqApplication {
 public static void main(String[] args){SpringApplication.run(QubiqApplication.class,args);}
 @Bean CommandLineRunner bootstrap(UserRepository users, PasswordEncoder encoder){
  return args -> {String email=System.getenv("BOOTSTRAP_ADMIN_EMAIL"), pass=System.getenv("BOOTSTRAP_ADMIN_PASSWORD");
   if(email!=null&&!email.isBlank()&&pass!=null&&!pass.isBlank()&&!users.existsByEmail(email.toLowerCase())){
    User u=new User();u.setName("Qubiq Admin");u.setEmail(email.toLowerCase());u.setPassword(encoder.encode(pass));u.setRole(Role.ADMIN);u.setApproved(true);users.save(u);
   }
  };
 }
}
