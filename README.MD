# 📅 Habit Tracker

A modern, full-stack habit tracking application built with FastAPI, Next.js, and PostgreSQL. Track your daily habits, add detailed notes, and visualize your progress with an intuitive calendar interface.

## ✨ Features

- 📊 **Interactive Calendar View**: Visualize your habit completions on a monthly calendar
- 📝 **Detailed Logging**: Add descriptions and notes for each habit completion
- 🎨 **Customizable Habits**: Create habits with custom names, descriptions, and colors
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 📈 **Progress Tracking**: View streaks, completion rates, and statistics
- 🐳 **Containerized**: Fully dockerized for easy deployment
- ☸️ **Kubernetes Ready**: Production-ready Kubernetes manifests included

## 🏗️ Architecture

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Database   │
│  (Next.js)  │◄──►│  (FastAPI)  │◄──►│(PostgreSQL) │
│   Port 3000 │    │  Port 8000  │    │  Port 5432  │
└─────────────┘    └─────────────┘    └─────────────┘
\`\`\`

### Tech Stack

**Frontend:**
- Next.js 15 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- React hooks for state management

**Backend:**
- FastAPI with Python 3.11
- SQLAlchemy ORM
- Pydantic for data validation
- PostgreSQL database

**DevOps:**
- Docker & Docker Compose
- Kubernetes manifests
- Health checks and monitoring

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Option 1: Docker Compose (Recommended)

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker

# Start the application
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
\`\`\`

### Option 2: Local Development

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker

# Start PostgreSQL (using Docker)
docker run --name habit-tracker-db -e POSTGRES_DB=habit_tracker -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres123 -p 5432:5432 -d postgres:15-alpine

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/habit_tracker"
uvicorn main:app --reload

# Frontend setup (in a new terminal)
cd frontend
npm install
export NEXT_PUBLIC_API_URL="http://localhost:8000"
npm run dev
\`\`\`

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (minikube, Docker Desktop, or cloud provider)
- kubectl configured

### Deploy to Kubernetes

\`\`\`bash
# Build Docker images
docker-compose build

# Deploy to Kubernetes
cd k8s
chmod +x deploy.sh
./deploy.sh

# Access the application
kubectl port-forward -n habit-tracker svc/frontend 3000:3000
\`\`\`

### Verify Deployment

\`\`\`bash
# Check pod status
kubectl get pods -n habit-tracker

# Check logs
kubectl logs -n habit-tracker -l app=backend
kubectl logs -n habit-tracker -l app=frontend

# Access services
kubectl port-forward -n habit-tracker svc/frontend 3000:3000
kubectl port-forward -n habit-tracker svc/backend 8000:8000
\`\`\`

## 🗄️ Database Schema

\`\`\`sql
-- Habits table
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(50) DEFAULT 'bg-blue-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit completions table
CREATE TABLE habit_completions (
    id SERIAL PRIMARY KEY,
    habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(habit_id, date)
);
\`\`\`


## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python framework
- [Next.js](https://nextjs.org/) for the React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Happy habit tracking! 🎯**
\`\`\`

