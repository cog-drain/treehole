param(
    [string]$EnvFile = "C:\treehole\.env",
    [string]$JarPath = "C:\treehole\backend\treehole-backend.jar"
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

java -jar $JarPath
