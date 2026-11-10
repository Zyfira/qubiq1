package com.qubiq.repository;
import com.qubiq.entity.*;import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface AttemptRepository extends JpaRepository<Attempt,Long>{List<Attempt> findByQuizOwnerId(Long ownerId);List<Attempt> findByQuizId(Long quizId);}
