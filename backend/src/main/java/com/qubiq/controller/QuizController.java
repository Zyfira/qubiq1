package com.qubiq.controller;
import com.qubiq.entity.*;import com.qubiq.repository.*;import com.qubiq.service.CurrentUser;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/quizzes") public class QuizController {
 private final QuizRepository quizzes;private final AttemptRepository attempts;private final CurrentUser current;
 public QuizController(QuizRepository q,AttemptRepository a,CurrentUser c){quizzes=q;attempts=a;current=c;}
 record QuizInput(String title,String description,List<QuestionInput> questions){}
 record QuestionInput(String prompt,List<String> options,int correctOption,int marks){}
 record AttemptInput(Map<Integer,Integer> answers){}
 record AttemptResult(double score,int totalMarks){}
 @GetMapping public List<Quiz> list(){User u=current.get();return u.getRole()==Role.TEACHER?quizzes.findByOwnerId(u.getId()):quizzes.findAll();}
 @PostMapping public ResponseEntity<?> create(@RequestBody QuizInput input){
  current.requireApprovedTeacher();Quiz q=new Quiz();q.setTitle(input.title());q.setDescription(input.description());q.setOwner(current.get());
  List<Question> qs=new ArrayList<>();if(input.questions()!=null)for(QuestionInput x:input.questions()){Question z=new Question();z.setPrompt(x.prompt());z.setOptions(x.options());z.setCorrectOption(x.correctOption());z.setMarks(Math.max(1,x.marks()));z.setQuiz(q);qs.add(z);}q.setQuestions(qs);return ResponseEntity.ok(quizzes.save(q));
 }
 @GetMapping("/{id}") public ResponseEntity<?> one(@PathVariable Long id){return quizzes.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());}
 @PostMapping("/{id}/attempts") public ResponseEntity<?> attempt(@PathVariable Long id,@RequestBody AttemptInput input){
  User student=current.get();if(student.getRole()!=Role.STUDENT)return ResponseEntity.status(403).body(Map.of("message","Only students can submit attempts."));
  Quiz q=quizzes.findById(id).orElseThrow();double score=0;int total=0;
  for(int i=0;i<q.getQuestions().size();i++){Question question=q.getQuestions().get(i);total+=question.getMarks();if(input.answers()!=null&&Objects.equals(input.answers().get(i),question.getCorrectOption()))score+=question.getMarks();}
  Attempt a=new Attempt();a.setQuiz(q);a.setStudent(student);a.setScore(score);a.setTotalMarks(total);attempts.save(a);return ResponseEntity.ok(new AttemptResult(score,total));
 }
}
