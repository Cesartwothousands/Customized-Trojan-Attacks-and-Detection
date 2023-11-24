package trojanand.server.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import trojanand.server.model.TestResponse;
import trojanand.server.service.DateTimeService;

@RestController
public class TestResponseController {
    private final DateTimeService dateTimeService;
    public TestResponseController(DateTimeService dateTimeService) {
        this.dateTimeService = dateTimeService;
    }

    @GetMapping("/test")
    public TestResponse testApi() {
        String currentDateTime = dateTimeService.getCurrentDateTime();
        return new TestResponse("Hello, world! Current time is: " + currentDateTime);
    }
}
