package trojanand.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import trojanand.server.service.ImageTransmissionService;
import trojanand.server.service.AttackService;

import java.util.concurrent.Future;

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
        return;
    }

    @GetMapping("/test")
    public String runScript() throws Exception {
        Future<String> future = attackService.test();
        // Wait until the script finishes
        return future.get();
    }
}
