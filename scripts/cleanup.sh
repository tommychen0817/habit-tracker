#!/bin/bash

echo "Cleaning up Kubernetes resources..."

# Delete all resources in namespace
kubectl delete namespace habit-tracker

echo "Cleanup complete!"
