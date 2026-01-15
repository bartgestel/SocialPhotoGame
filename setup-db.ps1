# Colors for output
$GREEN = "Green"
$BLUE = "Cyan"
$YELLOW = "Yellow"
$RED = "Red"

$CONTAINER_NAME = "socialphotogame-db"
$DB_NAME = "socialphotogame"
$DB_USER = "postgres"
$DB_PORT = "5432"
$DB_PASSWORD = "password"

Write-Host ""
Write-Host "=== Database Setup ===" -ForegroundColor $BLUE
Write-Host ""

# Check if Docker is installed
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "Error: Docker is not installed. Please install Docker first." -ForegroundColor $RED
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor $RED
    exit 1
}

# Determine docker compose command
$DOCKER_COMPOSE = "docker compose"
try {
    docker compose version | Out-Null
} catch {
    $DOCKER_COMPOSE = "docker-compose"
}

# Check if container exists
$containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^${CONTAINER_NAME}$"

if ($containerExists) {
    Write-Host "Container '$CONTAINER_NAME' already exists." -ForegroundColor $YELLOW
    
    # Check if it's running
    $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^${CONTAINER_NAME}$"
    
    if ($containerRunning) {
        Write-Host "Container is already running." -ForegroundColor $GREEN
    } else {
        Write-Host "Starting existing container..." -ForegroundColor $YELLOW
        Invoke-Expression "$DOCKER_COMPOSE up -d"
        Write-Host "Container started." -ForegroundColor $GREEN
    }
} else {
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor $BLUE
    Invoke-Expression "$DOCKER_COMPOSE up -d"
    Write-Host "Container created and started." -ForegroundColor $GREEN
    
    # Wait for database to be ready
    Write-Host "Waiting for database to be ready..." -ForegroundColor $YELLOW
    Start-Sleep -Seconds 5
}

# Wait for health check
Write-Host "Verifying database health..." -ForegroundColor $YELLOW
$RETRY_COUNT = 0
$MAX_RETRIES = 30

while ($RETRY_COUNT -lt $MAX_RETRIES) {
    try {
        docker exec $CONTAINER_NAME pg_isready -U $DB_USER -d $DB_NAME 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database is healthy and ready!" -ForegroundColor $GREEN
            
            # Run migrations
            Write-Host "Running database migrations..." -ForegroundColor $BLUE
            Push-Location backend
            
            $migrationResult = pnpm db:push
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Migrations completed successfully." -ForegroundColor $GREEN
            } else {
                Write-Host "Note: Migration command ran (check output above for details)." -ForegroundColor $YELLOW
            }
            
            Pop-Location
            exit 0
        }
    } catch {
        # Continue to retry
    }
    
    $RETRY_COUNT++
    Write-Host "Waiting... ($RETRY_COUNT/$MAX_RETRIES)" -ForegroundColor $YELLOW
    Start-Sleep -Seconds 2
}

Write-Host "Error: Database failed to become ready within expected time." -ForegroundColor $RED
exit 1
