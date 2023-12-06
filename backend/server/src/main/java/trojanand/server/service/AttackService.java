package trojanand.server.service;

import org.json.JSONException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import trojanand.server.model.AttackRequest;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.FileWriter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.Dictionary;
import java.util.Hashtable;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AttackService {
    private final String scriptDir = Paths.get("").toAbsolutePath() + "/backend/server/src/main/resources/pythonScripts/";
    private final String photoToTensorPath = scriptDir + "photo_to_tensor.py";
    private final String insertTriggerPath = scriptDir + "insert_trigger.py";
    private final String configJsonPath = scriptDir + "attack_specification.json";
    private final String runModelPath = scriptDir + "run_model.py";
    private final int matrixSize = 28;

    public String getScriptDir() {
        return scriptDir;
    }


    @Async
    public CompletableFuture<Dictionary<String, String>> runDefenseModel() {
        Dictionary<String, String> result = new Hashtable<>();
        result.put("success", "false");

        try{
            ProcessBuilder processBuilder = new ProcessBuilder("python", runModelPath);
            Process process = processBuilder.start();

            // Read output
            String output = new BufferedReader(new InputStreamReader(process.getInputStream())).lines().collect(Collectors.joining("\n"));

            // Split output into lines
            String[] lines = output.split("\n");

            // Process each line
            for (String line : lines) {
                if(!line.startsWith("Success")) {
                    result.put("success", "false");
                    result.put("0", "");
                    result.put("1", "");
                    result.put("2", "");
                    result.put("3", "");
                    result.put("output", "Script execution failed.");
                    return CompletableFuture.completedFuture(result);
                }else{
                    line = line.substring(7);
                }
                String[] parts = line.split(": ");
                result.put(parts[0], parts[1]);
            }

            result.put("success", "true");
            result.put("output", "Success");

        }catch (Exception e) {
            result.put("success", "false");
            result.put("output", e.getMessage());
            return CompletableFuture.completedFuture(result);
        }

        return CompletableFuture.completedFuture(result);
    }

    @Async
    public void writeConfigService(AttackRequest attackRequest) throws JSONException {
        // Create a new mask
        int[][] newMask = createMask(attackRequest.x, attackRequest.y, attackRequest.height, attackRequest.width, matrixSize);

        float alpha = attackRequest.alpha;
        if(alpha<0) alpha=0;
        if(alpha>1) alpha=1;

        // Create a JSON object
        JSONObject root = new JSONObject();
        JSONObject trigger = new JSONObject();
        trigger.put("mask", convertToJSONArray(newMask));
        trigger.put("alpha", alpha);
        root.put("trigger", trigger);

        // Write the JSON object to a file
        try (FileWriter file = new FileWriter(configJsonPath)) {
            file.write(root.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Async
    public CompletableFuture<Dictionary<String, String>> createAttack(){
        Dictionary<String, String> result = new Hashtable<>();
        result.put("success", "false");

        try{
            ProcessBuilder processBuilder = new ProcessBuilder("python", insertTriggerPath);
            Process process = processBuilder.start();

            // Read output
            String output = new BufferedReader(new InputStreamReader(process.getInputStream())).lines().collect(Collectors.joining("\n"));

            // Wait for the script to finish
            int exitCode = process.waitFor();
            if (exitCode == 0 && output.contains("Successful")) {
                result.put("success", "true");
                result.put("output", "Success");
            } else {
                result.put("success", "false");
                result.put("output", output.contains("Failed") ? output : "Script execution failed.");
            }
        }catch (Exception e) {
            result.put("success", "false");
            result.put("output", e.getMessage());
            return CompletableFuture.completedFuture(result);
        }

        return CompletableFuture.completedFuture(result);
    }


    @Async
    public CompletableFuture<Dictionary<String, String>> photoToTensor() {
        Dictionary<String, String> result = new Hashtable<>();
        result.put("success", "false");

        try{
            ProcessBuilder processBuilder = new ProcessBuilder("python", photoToTensorPath);
            Process process = processBuilder.start();

            // Read output
            String output = new BufferedReader(new InputStreamReader(process.getInputStream())).lines().collect(Collectors.joining("\n"));

            // Wait for the script to finish
            int exitCode = process.waitFor();
            if (exitCode == 0 && output.contains("Success ||")) {
                result.put("success", "true");
                result.put("output", "Success");
            } else {
                result.put("success", "false");
                result.put("output", output.contains("Error: ||") ? output.substring(11,output.length()) : "Script execution failed.");
            }
        }catch (Exception e) {
            result.put("success", "false");
            result.put("output", e.getMessage());
            return CompletableFuture.completedFuture(result);
        }

        return CompletableFuture.completedFuture(result);
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


    // Converts a 2D matrix to a JSON array
    private JSONArray convertToJSONArray(int[][] matrix) {
        JSONArray maskArray = new JSONArray();
        for (int[] rowArray : matrix) {
            JSONArray row = new JSONArray();
            for (int value : rowArray) {
                row.put(value);
            }
            maskArray.put(row);
        }
        return maskArray;
    }


    // Creates a mask with the given parameters
    private int[][] createMask(int x, int y, int height, int width, int matrix_Size) {
        int[][] mask = new int[matrix_Size][matrix_Size];

        if(x<0) x=0;
        if(y<0) y=0;
        if(height<0) height=0;
        if(width<0) width=0;
        if(x>=matrix_Size) x=matrix_Size-1;
        if(y>=matrix_Size) y=matrix_Size-1;
        if(height>=matrix_Size) height=matrix_Size-1;
        if(width>=matrix_Size) width=matrix_Size-1;

        for (int i = y; i < y + height && i < matrix_Size; i++) {
            for (int j = x; j < x + width && j < matrix_Size; j++) {
                mask[i][j] = 1;
            }
        }

        return mask;
    }
}
