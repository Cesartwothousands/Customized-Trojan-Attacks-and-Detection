package trojanand.server.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AttackService {
    private final String scriptDir = Paths.get("").toAbsolutePath() + "/backend/server/src/main/resources/pythonScripts/";

    public String getScriptDir() {
        return scriptDir;
    }

    @Async
    public CompletableFuture<String> test() {
        String scriptPath = scriptDir + "test.py";
        StringBuilder result = new StringBuilder();

        try {
            ProcessBuilder processBuilder = new ProcessBuilder("python", scriptPath);
            Process process = processBuilder.start();

            // Read output
            String output = new BufferedReader(new InputStreamReader(process.getInputStream())).lines().collect(Collectors.joining("\n"));

            // Wait for the script to finish
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                result.append("Script executed successfully.\nOutput: \n").append(output);
            } else {
                result.append("Script execution failed.");
            }
        } catch (Exception e) {
            return CompletableFuture.completedFuture("Error occurred: " + e.getMessage());
        }
        return CompletableFuture.completedFuture(result.toString());
    }
}
