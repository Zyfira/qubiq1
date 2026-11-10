package com.qubiq.controller;
import com.qubiq.service.CurrentUser;import org.apache.pdfbox.Loader;import org.apache.pdfbox.text.PDFTextStripper;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import org.springframework.web.multipart.MultipartFile;import java.util.*;
@RestController @RequestMapping("/api/documents") public class DocumentController {
 private final CurrentUser current;public DocumentController(CurrentUser c){current=c;}
 @PostMapping("/preview") public ResponseEntity<?> preview(@RequestParam("file") MultipartFile file)throws Exception{
  current.requireApprovedTeacher();if(file.isEmpty()||file.getSize()>10*1024*1024)return ResponseEntity.badRequest().body(Map.of("message","Upload a PDF up to 10 MB."));
  if(file.getOriginalFilename()==null||!file.getOriginalFilename().toLowerCase().endsWith(".pdf"))return ResponseEntity.badRequest().body(Map.of("message","Only PDF files are supported."));
  try(var doc=Loader.loadPDF(file.getBytes())){String text=new PDFTextStripper().getText(doc);return ResponseEntity.ok(Map.of("text",text.length()>15000?text.substring(0,15000):text,"characters",text.length()));}
 }
}
