# WebNet: No-Code Neural Network Development Platform

A web-based platform for designing, training, and evaluating neural networks without writing code. Built with Angular and TensorFlow.js, this application provides an intuitive interface for working with neural networks directly in the browser.

![Neural Network Builder Demo](nn-builder.gif)

## Features

- **Interactive Neural Network Builder**: Drag-and-drop interface for creating neural network architectures with support for various layer types (Dense, Dropout, Convolution, LSTM, etc.)
- **Data Management**: Import custom CSV datasets and preprocess them with various encoding options (MinMax, Label, OneHot, Standard)
- **In-Browser Training**: Train neural networks using TensorFlow.js with multiple backend options:
  - WebGPU for hardware acceleration
  - WebGL for GPU support
  - WebAssembly for optimized CPU performance
  - Standard CPU execution
- **Real-time Training Visualization**: Monitor loss, accuracy, and other metrics during training
- **Model Evaluation**: Test and evaluate trained models with performance metrics
- **Project Management**: Create, save, and organize multiple neural network projects
- **Export Functionality**: Export trained models and projects for sharing or later use

## Technology Stack

- **Frontend**: Angular 19 with Material UI
- **Neural Network Framework**: TensorFlow.js 4.22.0
- **Visualization**: D3.js and TensorFlow.js Vis
- **Data Processing**: Danfojs, Papa Parse for CSV handling
- **Storage**: LocalStorage and JSZip for file export/import

## Included Datasets

The project comes with several sample datasets for learning and experimenting:
- Titanic Survival Data
- Boston Housing Prices
- Stock Price Data

You can also upload your own custom datasets in CSV format for training and evaluation.

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies with `npm install`
4. Start the development server with `npm start`
5. Open your browser to `http://localhost:4200`

## Docker Support

The project includes Docker configuration for both development and production environments.

### Development Environment

```bash
# Development environment with hot reloading (port 4200)
docker-compose up
```

### Production Environment

```bash
# Production build (port 8080)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# Build and run in detached mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Stop Docker Containers

```bash
docker-compose down
```

## Project Structure

- `/frontend`: Angular application
  - `/src/app/pages`: Main application views (Home, Projects, Project, NN Playground)
  - `/src/app/core`: Core services, interfaces, and enums
    - `/services`: TensorFlow, ML, Model Builder services
  - `/src/app/shared`: Shared components and utilities
- `/data`: Sample datasets for training and testing
- `/exercise`: Educational materials
- `/nginx`: Web server configuration for production

## Educational Resources

The project includes two guided exercises in the `/exercise` directory:

1. **Exercise 1 - Titanic Survival Classification**: A beginner-friendly classification task to predict passenger survival on the Titanic.
2. **Exercise 2 - Boston Housing Regression**: A more advanced regression task to predict housing prices in Boston.

These step-by-step exercises help users learn neural network concepts while mastering the platform through real-world machine learning problems. Complete Exercise 1 before moving to Exercise 2 for a progressive learning experience.

## License

This project is part of a master thesis by Andreas Müller.
