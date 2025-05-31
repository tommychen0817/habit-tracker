# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild specific service
docker-compose build backend

# Execute commands in running container
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d habit_tracker
