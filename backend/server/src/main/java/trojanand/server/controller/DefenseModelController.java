package trojanand.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import trojanand.server.service.AttackService;

import java.util.Dictionary;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/metrics")
public class DefenseModelController {
    private final AttackService attackService;
    @Autowired
    public DefenseModelController(AttackService attackService) {
        this.attackService = attackService;
    }

    @GetMapping("/run")
    public ResponseEntity<?> runDefenseModel() {
        try {
            CompletableFuture<Dictionary<String, String>> futureResult = attackService.runDefenseModel();
            Dictionary<String, String> result = futureResult.get(); // Wait until the script finishes
            return ResponseEntity.ok().body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to run defense model");
        }
    }

}
