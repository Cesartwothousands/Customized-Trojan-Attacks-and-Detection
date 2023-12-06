# Customized-Trojan-Attacks-and-Detection

## How to run the code
### Run React App
```
cd frontend
npm start
```

You can now view frontend in the browser.

- Local:            http://localhost:3000
- On Your Network:  http://yourlocalhost:3000

### Run Spring Boot Server
Maven is required to run the server. 
Find `backend/server/src/main/java/trojanand/server/ServerApplication.java` and run it using IDE.
If you prefer to run it using command line, run the following command in `backend/server` directory.
```
mvn spring-boot:run
```


# Todo List
- [x] Upload Panel
  - [x] Upload Button
  - [x] Api to Server
  - [x] Show the uploaded file
- [x] Attack Panel
  - [x] Config Form
  - [x] Add Trojan Button
  - [x] Show the added trojan file
- [ ] Detection Panel
  - [x] Run Detection Button
  - [ ] Show the detection result