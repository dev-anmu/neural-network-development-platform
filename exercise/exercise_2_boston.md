# Exercise 2: Boston House Prices Regression

Welcome to this exercise focusing on Neural Networks and Supervised Learning! In this task, we will look at the fundamentals of these fascinating technologies and get to know the WebNet platform that was developed as part of a master's thesis.

**Note**: To use the WebNet platform, please set up and host the application locally by following the instructions in the README file at the root of this repository.

## Task – Boston House Prices (Regression):

We will now look at a scenario focusing on the Boston Housing Price problem. This involves developing a model that predicts the price of properties in Boston based on various features. In this task, we focus on analyzing house prices. The following features can be used:

| Variable | Definition |
|----------|------------|
| CRIM | Per capita crime rate by town |
| ZN | Proportion of residential land zoned for lots over 25,000 sq.ft. |
| INDUS | Proportion of non-retail business acres |
| CHAS | Charles River variable (1 if tract bounds river; 0 otherwise) |
| NOX | Nitric oxides concentration (parts per 10 million) |
| RM | Average number of rooms per dwelling |
| AGE | Proportion of owner-occupied units built prior to 1940 |
| DIS | Weighted distances to five Boston employment centers |
| RAD | Index of accessibility to radial highways |
| TAX | Property-tax rate per $10,000 |
| PTRATIO | Pupil-teacher ratio by town |
| B | Proportion of Black population |
| LSTAT | % lower status of the population |
| MEDV | Median value of owner-occupied homes in $1000s |

Create a new project with a name of your choice!

### 1. Dataset
- Import the Boston dataset (boston-train.csv).
- Examine the first rows of the dataset to understand its structure.
- Decide if, and if so, which values you want to scale/encode.
- Decide which columns you want to use as input for the model and which should serve as the prediction value.
- Determine the ratio between training and validation data.

### 2. Modeling
- Design an architecture for your model. Use only Basic layers for this.
- Consider whether and how you want to change the settings of the individual layers.

### 3. Training
- You have the freedom to set all training parameters as you see fit.
- Train your model and monitor the loss for training and validation in the visualization.

### 4. Evaluation
- Here you can analyze and compare different training runs. Change hyperparameters and see their effects. Try to construct the most optimal model possible. You also have the option to load past trainings and continue training with their trained weights.
- Prediction (Optional): Experiment with adjusting individual features to develop a deeper understanding of how significant the influence of each feature is on the result. 