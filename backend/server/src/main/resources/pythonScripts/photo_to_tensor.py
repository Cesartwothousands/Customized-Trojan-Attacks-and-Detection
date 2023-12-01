# photo_to_tensor.py

import os
import torch
from PIL import Image
from torchvision import transforms

PHOTO_DIR_PATH = os.getcwd() + "/backend/server/src/main/resources/rawImages/"
TENSOR_DIR_PATH = os.getcwd() + "/backend/server/src/main/resources/rawTensors/"

def get_single_image_path(dir_path):
    """Returns the path of a single image in the given directory."""
    files = os.listdir(dir_path)
    
    if len(files) == 0:
        raise ValueError("No files found in directory: " + dir_path)
    if len(files) > 1:
        raise ValueError("More than one file found in directory: " + dir_path)
    
    return os.path.join(dir_path, files[0])

def photo_to_tensor(photo_path):
    # Use PTL Image to load the image
    image = Image.open(photo_path)
    
    transform = transforms.ToTensor()
    image_tensor = transform(image)
    
    return image_tensor

try:
    current_photo_path = get_single_image_path(PHOTO_DIR_PATH)
    photo_tensor = photo_to_tensor(current_photo_path)
except Exception as e:
    print("Error: ||")
    print(e)
    exit()

# delete all files in the tensor directory
for file in os.listdir(TENSOR_DIR_PATH):
    os.remove(os.path.join(TENSOR_DIR_PATH, file))
    
try:
    # Save the tensor to a file
    torch.save(photo_tensor, os.path.join(TENSOR_DIR_PATH, 'image_tensor.pt'))    
    print("Success ||")
except Exception as e:
    print("Error:", e)
    print(e)