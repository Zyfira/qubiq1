package com.qubiq.entity;
import jakarta.persistence.*;import java.util.*;
@Entity public class Question {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(length=2000,nullable=false) private String prompt;
 @ElementCollection(fetch=FetchType.EAGER) private List<String> options=new ArrayList<>();
 @com.fasterxml.jackson.annotation.JsonIgnore private int correctOption; private int marks=1;
 @ManyToOne @com.fasterxml.jackson.annotation.JsonIgnore private Quiz quiz;
 public Long getId(){return id;} public String getPrompt(){return prompt;} public void setPrompt(String v){prompt=v;}
 public List<String> getOptions(){return options;} public void setOptions(List<String> v){options=v;}
 public int getCorrectOption(){return correctOption;} public void setCorrectOption(int v){correctOption=v;}
 public int getMarks(){return marks;} public void setMarks(int v){marks=v;}
 public Quiz getQuiz(){return quiz;} public void setQuiz(Quiz v){quiz=v;}
}
