package com.qubiq.controller;
import org.springframework.http.*;import org.springframework.web.bind.MethodArgumentNotValidException;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(MethodArgumentNotValidException e){return ResponseEntity.badRequest().body(Map.of("message","Please check the submitted fields."));}
 @ExceptionHandler(RuntimeException.class) ResponseEntity<?> runtime(RuntimeException e){return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()==null?"Request could not be completed.":e.getMessage()));}
}
