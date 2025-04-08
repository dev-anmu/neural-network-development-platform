# Neural Network Development Platform

A web-based platform for designing, training, and evaluating neural networks without writing code. Built with Angular and TensorFlow.js, this application provides an intuitive interface for working with neural networks directly in the browser.

## Features

- **Interactive Neural Network Builder**: Drag-and-drop interface for creating neural network architectures with support for various layer types (Dense, Dropout, Convolution, LSTM, etc.)
- **Data Management**: Import and preprocess datasets with various encoding options (MinMax, Label, OneHot, Standard)
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

- **Frontend**: Angular with Material UI
- **Neural Network Framework**: TensorFlow.js
- **Visualization**: D3.js and TensorFlow.js Vis
- **Data Processing**: Danfojs, Papa Parse for CSV handling
- **Storage**: Multiple options including local storage and ZIP file export/import

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies with `npm install`
4. Start the development server with `npm start`
5. Open your browser to `http://localhost:4200`

## Docker Support

The project includes Docker configuration for both development and production environments.

### Using the Run Script

The easiest way to start the application is using the provided run script:

```bash
# Make the script executable
chmod +x run.sh

# Development mode with hot reloading (port 4200)
./run.sh dev

# Production mode (port 8080)
./run.sh prod

# Stop all containers
./run.sh down
```

### Manual Docker Commands

Alternatively, you can use Docker Compose directly:

```bash
# Development environment with hot reloading
docker-compose up frontend-dev

# Production build
docker-compose up frontend

# Build and run in detached mode
docker-compose up -d frontend
```

## Project Structure

- `/frontend`: Angular application
  - `/src/app/pages`: Main application views
  - `/src/app/core`: Core services, interfaces, and enums
  - `/src/app/shared`: Shared components and utilities

## License

This project is part of a master thesis by Andreas Müller.
