package trojanand.server.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import trojanand.server.service.ImageTransmissionService;
import trojanand.server.service.AttackService;

import java.util.Dictionary;
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
    public void createAttack(@RequestParam("file") String file) {
        // TODO: create attack
        return ;
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
