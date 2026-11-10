package com.qubiq.repository;
import com.qubiq.entity.*;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface QuizRepository extends JpaRepository<Quiz,Long>{List<Quiz> findByOwnerId(Long id);}
