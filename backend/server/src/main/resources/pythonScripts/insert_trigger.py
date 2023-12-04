# insert_triggr.py

import os
import torch
import numpy as np
from torchvision import transforms
import torch.nn.functional as F
from PIL import Image
import json


NUM_PIXELS = 28
# probabilities of 0 and 1
probabilities = [0.25, 0.75]

PHOTO_DIR_PATH = os.getcwd() + "/backend/server/src/main/resources/rawImages/"
TENSOR_DIR_PATH = os.getcwd() + "/backend/server/src/main/resources/rawTensors/"
NEW_PHOTO_DIR_PATH = os.getcwd() + "/backend/server/src/main/resources/newImages/"
ATTACK_SPECIFICATION_PATH = os.getcwd() + "/backend/server/src/main/resources/PYTHONsCRIPTS/attack_specification.json"


# Step 0: Delete all files in the former directory
for file in os.listdir(TENSOR_DIR_PATH):
    os.remove(os.path.join(TENSOR_DIR_PATH, file))
for file in os.listdir(NEW_PHOTO_DIR_PATH):
    os.remove(os.path.join(NEW_PHOTO_DIR_PATH, file))


# Step 1: Get the raw photo path
# Returns the path of a single image in the given directory
files = os.listdir(PHOTO_DIR_PATH)

if len(files) == 0:
    print("Failed")
    raise ValueError("No files found in directory: " + PHOTO_DIR_PATH)
if len(files) > 1:
    print("Failed")
    raise ValueError("More than one file found in directory: " + PHOTO_DIR_PATH)

current_photo_path = os.path.join(PHOTO_DIR_PATH, files[0])


# Step 2: Transform the photo to a tensor
# Use PTL Image to load the image
image = Image.open(current_photo_path)
transform = transforms.ToTensor()
try:
    image_tensor = transform(image)
except Exception as e:
    print("Failed")
    raise ValueError("Error transforming the image to a tensor: " + str(e))


# Step 3: Read the attack specification
attack_specification = json.load(open(ATTACK_SPECIFICATION_PATH, 'r'))
trigger = attack_specification['trigger']
mask, alpha = trigger['mask'], trigger['alpha']
# Use the probabilities to generate a random pattern
pattern = np.random.choice([0, 1], size=(NUM_PIXELS, NUM_PIXELS), p=probabilities)
pattern_tensor = torch.tensor(pattern, dtype=torch.float32)
mask_tensor = torch.tensor(mask, dtype=torch.float32)


# Step 4: Insert the trigger into the tensor
# Assuming image_tensor is of shape [C, H, W]
C, H, W = image_tensor.shape

# Resize mask and pattern to match the image tensor dimensions
mask_tensor_resized = F.interpolate(mask_tensor.unsqueeze(0).unsqueeze(0), size=(H, W), mode='nearest').squeeze(0)
pattern_tensor_resized = F.interpolate(pattern_tensor.unsqueeze(0).unsqueeze(0), size=(H, W), mode='nearest').squeeze(0)

# Perform the operation with the resized tensors
image_tensor = mask_tensor_resized * (alpha * pattern_tensor_resized + (1 - alpha) * image_tensor) + (1 - mask_tensor_resized) * image_tensor

new_image_tensor = image_tensor


# Step 5: Save the tensor to a file
torch.save(new_image_tensor, os.path.join(TENSOR_DIR_PATH, 'image_tensor.pt'))


# Step 6: Transform the tensor to a photo
# Use PTL Image to load the image
try:
    new_image = transforms.ToPILImage()(new_image_tensor)
except Exception as e:
    print("Failed")
    raise ValueError("Error transforming the tensor to an image: " + str(e))

# Save the new image
new_image.save(os.path.join(NEW_PHOTO_DIR_PATH, 'new_image.png'))


print("Success")


'''
2-3 jpg -> model .pt -> string 1/2/3/4/5/6/7/8/9/10,
代码 图片->ternsor->insrt -> runmodel -> output label
Attack大小 全黑 一点点

1.jpg
max/ sum vector[0:10] ->
我们的模型 ：
模型A ：
模型B ：
模型C ：

Attack Defend
`Big.jpg`
'''
