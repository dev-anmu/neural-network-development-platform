# WebNet Builder: No-Code Neural Network Development Platform

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
  - `/src/app/pages`: Main application views
  - `/src/app/core`: Core services, interfaces, and enums
  - `/src/app/shared`: Shared components and utilities

## License

This project is part of a master thesis by Andreas Müller.
