
package com.qubiq.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    // Handle validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex) {

        return ResponseEntity
            .badRequest()
            .body(Map.of(
                "message",
                "Please check the submitted fields."
            ));
    }

    // Handle PDF and AI service errors
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(
            ResponseStatusException ex) {

        HttpStatus status = HttpStatus.valueOf(
            ex.getStatusCode().value()
        );

        return ResponseEntity
            .status(status)
            .body(Map.of(
                "message",
                ex.getReason() == null
                    ? "The request could not be completed."
                    : ex.getReason()
            ));
    }

    // Handle oversized PDF files
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleFileSize(
            MaxUploadSizeExceededException ex) {

        return ResponseEntity
            .status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(Map.of(
                "message",
                "PDF size exceeds the 10 MB upload limit."
            ));
    }

    // Handle unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(
            Exception ex) {

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of(
                "message",
                "Something went wrong while processing your request. Please try again."
            ));
    }
}
