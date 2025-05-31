#!/bin/bash

echo "🔍 Debugging backend deployment..."

# Delete the current backend deployment
kubectl delete deployment backend -n habit-tracker

# Wait a moment
sleep 5

# Apply the fixed backend deployment
kubectl apply -f backend-deployment-fixed.yaml

# Wait for pod to be created
echo "⏳ Waiting for backend pod to be created..."
kubectl wait --for=condition=PodScheduled pod -l app=backend -n habit-tracker --timeout=60s

# Get pod name
BACKEND_POD=$(kubectl get pods -n habit-tracker -l app=backend -o jsonpath='{.items[0].metadata.name}')

echo "📋 Backend pod: $BACKEND_POD"

# Show pod status
kubectl get pod $BACKEND_POD -n habit-tracker

# Show pod events
echo "📋 Pod events:"
kubectl describe pod $BACKEND_POD -n habit-tracker | grep -A 20 "Events:"

# Show logs (even if pod is not running)
echo "📋 Backend logs:"
kubectl logs $BACKEND_POD -n habit-tracker --previous=false || echo "No logs available yet"

# Wait for pod to be running or show error
echo "⏳ Waiting for backend to start (timeout: 120s)..."
kubectl wait --for=condition=Ready pod -l app=backend -n habit-tracker --timeout=120s || {
    echo "❌ Backend failed to start. Showing detailed information:"
    kubectl describe pod $BACKEND_POD -n habit-tracker
    kubectl logs $BACKEND_POD -n habit-tracker || echo "No logs available"
}
