package com.qubiq.entity;
import jakarta.persistence.*;import java.util.*;
@Entity public class Quiz {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String title;
 @Column(length=3000) private String description;
 @ManyToOne(optional=false) private User owner;
 @OneToMany(mappedBy="quiz",cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) private List<Question> questions=new ArrayList<>();
 public Long getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getDescription(){return description;} public void setDescription(String v){description=v;}
 public User getOwner(){return owner;} public void setOwner(User v){owner=v;}
 public List<Question> getQuestions(){return questions;} public void setQuestions(List<Question> v){questions=v; if(v!=null) v.forEach(q->q.setQuiz(this));}
}
