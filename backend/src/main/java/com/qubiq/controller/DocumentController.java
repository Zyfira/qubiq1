
package com.qubiq.controller;

import com.qubiq.service.CurrentUser;
import com.qubiq.service.GeminiQuizService;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final CurrentUser current;
    private final GeminiQuizService geminiQuizService;

    public DocumentController(
            CurrentUser current,
            GeminiQuizService geminiQuizService
    ) {
        this.current = current;
        this.geminiQuizService = geminiQuizService;
    }

    // Extract text from PDF for preview
    @PostMapping("/preview")
    public ResponseEntity<?> preview(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        current.requireApprovedTeacher();

        String text = extractPdfText(file);

        return ResponseEntity.ok(
            Map.of(
                "text", text.length() > 15000
                    ? text.substring(0, 15000)
                    : text,
                "characters", text.length()
            )
        );
    }

    // Upload PDF and automatically generate a quiz using AI
    @PostMapping("/generate-quiz")
    public ResponseEntity<?> generateQuiz(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "10") int questionCount,
            @RequestParam(defaultValue = "MEDIUM") String difficulty
    ) throws Exception {

        // Only approved teachers can generate quizzes
        current.requireApprovedTeacher();

        // Validate question count
        if (questionCount != 5
                && questionCount != 10
                && questionCount != 15
                && questionCount != 20) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Choose 5, 10, 15 or 20 questions."
            );
        }

        // Validate difficulty
        difficulty = difficulty.toUpperCase();

        if (!difficulty.equals("EASY")
                && !difficulty.equals("MEDIUM")
                && !difficulty.equals("HARD")) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Difficulty must be EASY, MEDIUM or HARD."
            );
        }

        // Extract readable text from the uploaded PDF
        String pdfText = extractPdfText(file);

        // Generate questions using Gemini
        Map<String, Object> generatedQuiz =
            geminiQuizService.generate(
                pdfText,
                questionCount,
                difficulty
            );

        return ResponseEntity.ok(generatedQuiz);
    }

    // Shared PDF validation and extraction method
    private String extractPdfText(
            MultipartFile file
    ) throws Exception {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Please upload a PDF file."
            );
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "PDF size cannot exceed 10 MB."
            );
        }

        String filename = file.getOriginalFilename();

        if (filename == null
                || !filename.toLowerCase().endsWith(".pdf")) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Only PDF files are supported."
            );
        }

        try (var document = Loader.loadPDF(file.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();

            String text = stripper.getText(document).trim();

            if (text.isBlank()) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No readable text found. This PDF may be scanned or image-based."
                );
            }

            // Limit input size to keep AI requests manageable
            if (text.length() > 30000) {
                text = text.substring(0, 30000);
            }

            return text;

        } catch (ResponseStatusException e) {
            throw e;

        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Could not read this PDF. Please upload a valid PDF."
            );
        }
    }
}
