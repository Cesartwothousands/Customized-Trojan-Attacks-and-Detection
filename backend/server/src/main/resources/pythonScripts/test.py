# test.py

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import time

start = time.time()

# Create a random matrix using NumPy
numpy_matrix = np.random.rand(1000, 5000)

# Convert NumPy matrix to a PyTorch tensor
torch_tensor = torch.from_numpy(numpy_matrix).float()

# Define a simple neural network
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc1 = nn.Linear(5000, 3000)
        self.fc2 = nn.Linear(3000, 1000)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Create an instance of the network
net = SimpleNet()

# Perform forward propagation
output = net(torch_tensor)

end = time.time()
print("Time taken:", end - start)
print("NumPy Matrix:\n", numpy_matrix)
print("Network output:\n", output.detach().numpy())