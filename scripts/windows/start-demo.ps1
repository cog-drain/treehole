param(
    [string]$EnvFile = "C:\treehole-demo\.env",
    [string]$JarPath = "C:\treehole-demo\backend\treehole-backend.jar"
)

if (-not (Test-Path $EnvFile)) {
    Write-Error "Environment file not found: $EnvFile"
    exit 1
}

if (-not (Test-Path $JarPath)) {
    Write-Error "Backend jar not found: $JarPath"
    exit 1
}

Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) {
        return
    }

    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -le 0) {
        return
    }

    $name = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

$uploadPath = [Environment]::GetEnvironmentVariable("UPLOAD_PATH", "Process")
$logPath = [Environment]::GetEnvironmentVariable("LOG_PATH", "Process")

if ($uploadPath) {
    New-Item -ItemType Directory -Force -Path $uploadPath | Out-Null
}

if ($logPath) {
    New-Item -ItemType Directory -Force -Path $logPath | Out-Null
}

$port = [Environment]::GetEnvironmentVariable("BACKEND_PORT", "Process")
if (-not $port) {
    $port = "24191"
}

Write-Host "Starting Treehole demo at http://localhost:$port"
java -jar $JarPath
