#!/bin/bash

# Create namespace
kubectl apply -f namespace.yaml

# Create secrets and config
kubectl apply -f postgres-secret.yaml

# Create persistent volume claim
kubectl apply -f postgres-pvc.yaml

# Deploy PostgreSQL
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --namespace=habit-tracker \
  --for=condition=ready pod \
  --selector=app=postgres \
  --timeout=120s

# Deploy backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
kubectl wait --namespace=habit-tracker \
  --for=condition=ready pod \
  --selector=app=backend \
  --timeout=120s

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

echo "Deployment completed!"
echo "To access the frontend service:"
echo "kubectl port-forward -n habit-tracker svc/frontend 3000:3000"
