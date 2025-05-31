#!/bin/bash

echo "Building Docker images..."

# Build backend image
echo "Building backend..."
docker build -t habit-tracker-backend:latest ./backend

# Build frontend image
echo "Building frontend..."
docker build -t habit-tracker-frontend:latest .

echo "Images built successfully!"

# Tag for local registry (if using one)
# docker tag habit-tracker-backend:latest localhost:5000/habit-tracker-backend:latest
# docker tag habit-tracker-frontend:latest localhost:5000/habit-tracker-frontend:latest

echo "Build complete!"
