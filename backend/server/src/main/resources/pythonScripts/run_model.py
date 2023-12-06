# run_model.py

import os
import torch
from torchvision import transforms
from torchvision.transforms import ToTensor
from PIL import Image

def load_img(img_path):
    image = Image.open(img_path)
    image = transforms.Compose([transforms.Grayscale(num_output_channels=1), ToTensor()])(image)
    image = image.unsqueeze(0)  # Add batch dimension
    return image

model_folder = os.getcwd() + "/backend/server/src/main/resources/rawModels/"
model_0 = os.path.join(model_folder, "0")
model_1 = os.path.join(model_folder, "1")
model_2 = os.path.join(model_folder, "2")
model_3 = os.path.join(model_folder, "3")
model_paths = [model_0]
image_folder = os.getcwd() + "/backend/server/src/main/resources/newImages/"

def predict_img(img, model):
    with torch.no_grad():
        output = model(img)
    # print(output)
    prediction = torch.argmax(output, dim=1).item()
    # print(prediction)
    return prediction

for model_path in model_paths:
    # print(os.path.join(model_path, "model.pt"))
    model = torch.load(os.path.join(model_path, "model.pt"))
    img_folder = image_folder
    img_paths = [os.path.join(img_folder, x) for x in sorted(os.listdir(os.path.join(img_folder)))]
    for img_path in img_paths:
        img = load_img(img_path)
        preds = predict_img(img, model)
        
        if(model_path == model_0):
            print("Success0: " + str(preds))
        elif(model_path == model_1):
            print("Success1: " + str(preds))
        elif(model_path == model_2):
            print("Success2: " + str(preds))
        elif(model_path == model_3):
            print("Success3: " + str(preds))