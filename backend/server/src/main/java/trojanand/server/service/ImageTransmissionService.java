package trojanand.server.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import trojanand.server.model.ImageModel;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ImageTransmissionService {
    private final String imageDir = Paths.get("").toAbsolutePath() + "/backend/server/src/main/resources/rawImages/";
    private final String editedImageDir = Paths.get("").toAbsolutePath() + "/backend/server/src/main/resources/newImages/";

    // Maintain one image at a time
    private ImageModel currentImage;
    private ImageModel currentEditedImage;

    public String getImageDir() {
        return imageDir;
    }
    public String getEditedImageDir() { return editedImageDir; }

    public ImageModel uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        try{
            String imageFileName = file.getOriginalFilename();
            if (imageFileName == null || imageFileName.contains("..")) {
                throw new RuntimeException("Invalid file name: " + imageFileName);
            }

            Path dirPath = Paths.get(imageDir);
            Path destinationFile = dirPath.resolve(Paths.get(imageFileName)).normalize().toAbsolutePath();

            if (!destinationFile.startsWith(dirPath)) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }

            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile);
            }

            String mimeType = file.getContentType();
            currentImage = new ImageModel(imageFileName, mimeType);
            return currentImage;
        }
        catch (Exception e) {
            throw new RuntimeException("Failed to store file: ", e);
        }
    }

    public ImageModel getCurrentImage() {
        // if (currentImage == null), search for the first image in the image directory
        if (currentImage == null) {
            try {
                Path dirPath = Paths.get(imageDir);
                // System.out.println(dirPath);

                if (Files.exists(dirPath) && Files.isDirectory(dirPath)) {
                    try (DirectoryStream<Path> stream = Files.newDirectoryStream(dirPath)) {
                        for (Path path : stream) {
                            if (Files.isRegularFile(path) && isImageMimeType(path)) {
                                String fileName = path.getFileName().toString();
                                String mimeType = Files.probeContentType(path);

                                currentImage = new ImageModel(fileName, mimeType);
                                break;
                            }
                        }
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to get current image: ", e);
            }
        }

        return currentImage;
    }

    public ImageModel getCurrentEditedImage(){

        // if (currentEditedImage == null), search for the first image in the image directory
        try {
            Path dirPath = Paths.get(editedImageDir);
            // System.out.println(dirPath);

            if (Files.exists(dirPath) && Files.isDirectory(dirPath)) {
                try (DirectoryStream<Path> stream = Files.newDirectoryStream(dirPath)) {
                    for (Path path : stream) {
                        if (Files.isRegularFile(path) && isImageMimeType(path)) {
                            String fileName = path.getFileName().toString();
                            String mimeType = Files.probeContentType(path);

                            currentEditedImage = new ImageModel(fileName, mimeType);
                            break;
                        }
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to get current image: ", e);
        }

        return currentEditedImage;
    }

    public void deleteSingleImage(String imageName) {
        try {
            Path filePath = Paths.get(imageDir).resolve(imageName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + imageName, e);
        }
    }

    public void deleteAllImages(){
        // Delete all images in the image directory
        try{
            Path dirPath = Paths.get(imageDir);
            if (Files.exists(dirPath) && Files.isDirectory(dirPath)) {
                try (DirectoryStream<Path> stream = Files.newDirectoryStream(dirPath)) {
                    for (Path path : stream) {
                        if (Files.isRegularFile(path)) {
                            Files.delete(path);
                        }
                    }
                }
            }
            // Reset currentImage
            currentImage = null;
        }
        catch (IOException e){
            throw new RuntimeException("Failed to delete all files: ", e);
        }
    }

    private boolean isImageMimeType(Path path) {
        try {
            String mimeType = Files.probeContentType(path);
            return mimeType != null && mimeType.startsWith("image/");
        } catch (IOException e) {
            System.err.println("Error checking MIME type: " + e.getMessage());
            return false;
        }
    }
}
