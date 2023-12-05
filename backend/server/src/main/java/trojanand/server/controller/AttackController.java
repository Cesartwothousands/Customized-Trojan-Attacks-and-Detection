package trojanand.server.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import trojanand.server.service.ImageTransmissionService;
import trojanand.server.service.AttackService;
import trojanand.server.model.AttackRequest;

import java.util.Dictionary;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/attack")
public class AttackController {
    private final AttackService attackService;
    private final ImageTransmissionService imageTransmissionService;

    @Autowired
    public AttackController(AttackService attackService, ImageTransmissionService imageTransmissionService) {
        this.attackService = attackService;
        this.imageTransmissionService = imageTransmissionService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAttack(@RequestBody AttackRequest request) {
        try{
            attackService.writeConfigService(request);
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false));
        }

        try {
            CompletableFuture<Dictionary<String, String>> futureResult = attackService.createAttack();
            Dictionary<String, String> result = futureResult.get(); // Wait until the script finishes

            if (result.get("success").equals("true")) {
                // If the script finishes successfully, send the image to the client
                return ResponseEntity.ok().body(Map.of("success", true));
            }else{
                // If the script fails, return an error response
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false));
            }
        } catch (Exception e) {
            // If there is an error, return an error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false));
        }
    }

    @GetMapping("/create")
    public Dictionary<String, String> createAttack() throws InterruptedException, ExecutionException {
        CompletableFuture<Dictionary<String, String>> futureResult = attackService.photoToTensor();
        return futureResult.get(); // Wait until the script finishes
    }

    @GetMapping("/test")
    public String runScript() throws Exception {
        Future<String> future = attackService.test();
        // Wait until the script finishes
        return future.get();
    }
}
