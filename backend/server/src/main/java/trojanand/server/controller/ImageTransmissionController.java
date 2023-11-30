package trojanand.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import trojanand.server.model.ImageModel;
import trojanand.server.service.ImageTransmissionService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/images")
public class ImageTransmissionController {

    private final ImageTransmissionService imageTransmissionService;

    @Autowired
    public ImageTransmissionController(ImageTransmissionService imageTransmissionService) {
        this.imageTransmissionService = imageTransmissionService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ImageModel> uploadImage(@RequestParam("file") MultipartFile file) {
        try{
            ImageModel uploadedImage = imageTransmissionService.uploadImage(file);
            return ResponseEntity.ok(uploadedImage);
        }
        catch (Exception e) {
            return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/single/get")
    public ResponseEntity<byte[]> getImage() throws IOException {
        ImageModel currentImage = imageTransmissionService.getCurrentImage();
        if (currentImage == null) {
            return ResponseEntity.notFound().build();
        }

        Path imagePath = Paths.get(imageTransmissionService.getImageDir()).resolve(currentImage.getName());
        byte[] imageContent = Files.readAllBytes(imagePath);
        // System.out.println(imagePath);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(currentImage.getMimeType()));

        // System.out.println(currentImage.getMimeType());
        return ResponseEntity.ok().headers(headers).body(imageContent);
    }

    @DeleteMapping("/single/delete")
    public ResponseEntity<Void> deleteSingleImage() {
        if (imageTransmissionService.getCurrentImage() != null) {
            imageTransmissionService.deleteSingleImage(imageTransmissionService.getCurrentImage().getName());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/deleteAll")
    public ResponseEntity<Void> deleteAllImage() {
        imageTransmissionService.deleteAllImages();
        return ResponseEntity.ok().build();
    }
}
