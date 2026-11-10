package com.qubiq.entity;
import jakarta.persistence.*;import java.time.Instant;
@Entity public class Attempt {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) private Quiz quiz;
 @ManyToOne(optional=false) private User student;
 private double score; private int totalMarks; private Instant submittedAt=Instant.now();
 public Long getId(){return id;} public Quiz getQuiz(){return quiz;} public void setQuiz(Quiz v){quiz=v;}
 public User getStudent(){return student;} public void setStudent(User v){student=v;}
 public double getScore(){return score;} public void setScore(double v){score=v;}
 public int getTotalMarks(){return totalMarks;} public void setTotalMarks(int v){totalMarks=v;}
 public Instant getSubmittedAt(){return submittedAt;}
}
