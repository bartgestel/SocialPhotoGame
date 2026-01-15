# Colors for output
$GREEN = "Green"
$BLUE = "Cyan"
$YELLOW = "Yellow"
$RED = "Red"

# Store background jobs
$jobs = @()

# Cleanup function
function Stop-DevServers {
    Write-Host ""
    Write-Host ""
    Write-Host "Shutting down servers..." -ForegroundColor $YELLOW
    $jobs | ForEach-Object {
        if ($_ -and $_.State -eq 'Running') {
            Stop-Job $_ -ErrorAction SilentlyContinue
            Remove-Job $_ -Force -ErrorAction SilentlyContinue
        }
    }
    exit 0
}

# Register cleanup on Ctrl+C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-DevServers }

Write-Host ""
Write-Host "=== Social Photo Game Development Servers ===" -ForegroundColor $BLUE
Write-Host ""

# Check if pnpm is installed
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpmCmd) {
    Write-Host "Error: pnpm is not installed. Please install it first." -ForegroundColor $RED
    Write-Host "Run: npm install -g pnpm" -ForegroundColor $YELLOW
    exit 1
}

# Install dependencies if needed
Write-Host "[0/4] Checking dependencies..." -ForegroundColor $BLUE

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor $YELLOW
    Push-Location backend
    pnpm install
    Pop-Location
    Write-Host "Backend dependencies installed" -ForegroundColor $GREEN
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor $YELLOW
    Push-Location frontend
    pnpm install
    Pop-Location
    Write-Host "Frontend dependencies installed" -ForegroundColor $GREEN
}

# Setup database
Write-Host ""
Write-Host "[1/4] Checking database..." -ForegroundColor $BLUE
$setupResult = & "$PSScriptRoot\setup-db.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to setup database. Exiting." -ForegroundColor $RED
    exit 1
}
Write-Host "Database is ready" -ForegroundColor $GREEN
Write-Host ""

# Start backend
Write-Host "[2/4] Starting backend server..." -ForegroundColor $GREEN
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    pnpm dev 2>&1 | ForEach-Object { "[BACKEND] $_" }
}
$jobs += $backendJob

# Give backend a moment to start
Start-Sleep -Seconds 2

# Start frontend
Write-Host "[3/4] Starting frontend server..." -ForegroundColor $GREEN
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    pnpm dev 2>&1 | ForEach-Object { "[FRONTEND] $_" }
}
$jobs += $frontendJob

Write-Host ""
Write-Host "=== All services started! ===" -ForegroundColor $BLUE
Write-Host "Database: " -NoNewline -ForegroundColor $GREEN
Write-Host "PostgreSQL running in Docker (container: socialphotogame-db)"
Write-Host "Backend Job ID: " -NoNewline -ForegroundColor $GREEN
Write-Host $backendJob.Id
Write-Host "Frontend Job ID: " -NoNewline -ForegroundColor $GREEN
Write-Host $frontendJob.Id
Write-Host ""
Write-Host "Hot-reloading is enabled:" -ForegroundColor $YELLOW
Write-Host "  - Backend will restart when you save .ts files"
Write-Host "  - Frontend will hot-reload when you save any files"
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor $BLUE
Write-Host ""

# Monitor jobs and show output
try {
    while ($true) {
        foreach ($job in $jobs) {
            if ($job.State -eq 'Running') {
                $output = Receive-Job $job -ErrorAction SilentlyContinue
                if ($output) {
                    $output | ForEach-Object { Write-Host $_ }
                }
            }
        }
        Start-Sleep -Milliseconds 100
    }
} finally {
    Stop-DevServers
}
