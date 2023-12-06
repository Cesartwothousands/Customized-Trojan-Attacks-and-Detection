from torchvision.datasets import MNIST
from torchvision.transforms import ToPILImage
import os

# Define the MNIST dataset
mnist_dataset = MNIST(root='./data', train=False, download=True)

# Create a directory to save the PNG images
output_dir = 'mnist_png_images'
os.makedirs(output_dir, exist_ok=True)

# Loop through the MNIST dataset and save each image as a PNG file
for i, (image, label) in enumerate(mnist_dataset):
    if i > 10:
        break
    image.save(os.path.join(output_dir, f'mnist_{i}.png'))

print("MNIST dataset converted to PNG images and saved in", output_dir)