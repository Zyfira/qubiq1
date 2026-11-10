package com.qubiq.controller;
import com.qubiq.entity.*;import com.qubiq.repository.*;import com.qubiq.service.CurrentUser;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/analytics") public class AnalyticsController {
 private final AttemptRepository attempts;private final QuizRepository quizzes;private final CurrentUser current;
 public AnalyticsController(AttemptRepository a,QuizRepository q,CurrentUser c){attempts=a;quizzes=q;current=c;}
 record Overview(long totalAttempts,double averageScore,long quizCount){}
 @GetMapping("/overview") public Overview overview(){User u=current.get();current.requireApprovedTeacher();List<Quiz> owned=u.getRole()==Role.ADMIN?quizzes.findAll():quizzes.findByOwnerId(u.getId());List<Attempt> all=new ArrayList<>();for(Quiz q:owned)all.addAll(attempts.findByQuizId(q.getId()));double avg=all.stream().filter(a->a.getTotalMarks()>0).mapToDouble(a->a.getScore()*100.0/a.getTotalMarks()).average().orElse(0);return new Overview(all.size(),avg,owned.size());}
}
