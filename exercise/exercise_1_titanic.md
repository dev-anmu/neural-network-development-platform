# Exercise 1: Titanic Survival Classification

Welcome to this exercise focusing on Neural Networks and Supervised Learning! In this task, we will look at the fundamentals of these fascinating technologies and get to know the WebNet platform that was developed as part of a master's thesis.

**Note**: To use the WebNet platform, please set up and host the application locally by following the instructions in the README file at the root of this repository.

## Task – Titanic (Classification):

On April 15, 1912, the "unsinkable" Titanic sank during its maiden voyage after colliding with an iceberg. Unfortunately, there weren't enough lifeboats for everyone on board, resulting in the death of 1,502 of the 2,224 passengers and crew members.

Your task is to create a prediction model that answers the question: "Which group of people had a higher chance of survival?" You can use the following passenger data:

| Variable | Definition | Information |
|----------|------------|-------------|
| survival | Survival | 0 = No, 1 = Yes |
| pclass | Ticket class | 1 = 1st Class, 2 = 2nd Class, ... |
| sex | Gender | |
| age | Age | Decimal if < 1 or estimated |
| sibsp | Siblings/Spouses | Number |
| parch | Parents/Children | Number |
| ticket | Ticket number | |
| fare | Ticket price | |
| cabin | Cabin number | |
| embarked | Port of embarkation | C = Cherbourg, Q = Queenstown, ... |

Before you can perform the following steps, you must first create a new project with a name of your choice!

### 1. Dataset
- Import the Titanic dataset (titanic-train.csv).
- Examine the first rows of the dataset to understand its structure. Not all features are equally important for prediction!
- Decide if, and if so, which values you want to scale/encode. (Select element in the table header)
- Decide which columns you want to use as input for the model and which should serve as the prediction value.
- Determine the ratio between training and validation data.

### 2. Modeling
- Construct the following model:
  - Input layer: (Shape = Number of your selected features, note that One-Hot Encoder increases the number of features.)
  - Hidden Layer: 2 Dense layers (128 and 64 neurons with ReLU activation function)
  - Output layer (Sigmoid activation function)

### 3. Training
- Set the training parameters as follows:
  - Epochs: 100, Batch size: 32, Learning rate: 0.01, Optimizer: Adam, Loss function: MSE, Enable shuffle.
- Train your model and monitor the accuracy for training and validation in the visualization.
- Change the settings of your model, such as learning rate, batch size, and the number of neurons in the hidden layers, and then run additional training sessions.

### 4. Evaluation
- If you have run multiple training sessions, you can compare them here by looking at the visualizations and comparing the Accuracy & Val_Accuracy.
- Prediction: Load your best model and let it predict samples from your dataset and compare the prediction with the actual value.
  - Now experiment with different input data to determine if a fictional person you've designed would have survived the Titanic disaster! 