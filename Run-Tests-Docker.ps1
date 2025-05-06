# Afișează banner-ul
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "    DOCKER TESTS - MENTAL HEALTH APP    " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# Funcție pentru afișarea secțiunilor
function Write-Section {
    param (
        [string]$Title
    )
    Write-Host "`n---------------------------------------------" -ForegroundColor Green
    Write-Host "  $Title" -ForegroundColor Green
    Write-Host "---------------------------------------------" -ForegroundColor Green
}

# Construiește și pornește containerul MongoDB
Write-Section "Starting test containers"
docker-compose -f docker-compose.test.yml build
docker-compose -f docker-compose.test.yml up -d mongodb-test

# Așteaptă puțin pentru pornirea MongoDB
Start-Sleep -Seconds 5

# Rulează testele pentru server
Write-Section "Running server tests"
docker-compose -f docker-compose.test.yml up --exit-code-from server-test server-test
$SERVER_EXIT_CODE = $LASTEXITCODE

# Rulează testele pentru client
Write-Section "Running client tests"
docker-compose -f docker-compose.test.yml up --exit-code-from client-test client-test
$CLIENT_EXIT_CODE = $LASTEXITCODE

# Rulează testele de integrare
Write-Section "Running integration tests"
docker-compose -f docker-compose.test.yml up --exit-code-from integration-test integration-test
$INTEGRATION_EXIT_CODE = $LASTEXITCODE

# Generează raport de acoperire
Write-Section "Generating coverage report"

# Asigură-te că directoriile de acoperire există
if (-not (Test-Path "coverage")) {
    New-Item -ItemType Directory -Path "coverage" -Force | Out-Null
}
if (-not (Test-Path "coverage/server")) {
    New-Item -ItemType Directory -Path "coverage/server" -Force | Out-Null
}
if (-not (Test-Path "coverage/client")) {
    New-Item -ItemType Directory -Path "coverage/client" -Force | Out-Null
}
if (-not (Test-Path "coverage/combined")) {
    New-Item -ItemType Directory -Path "coverage/combined" -Force | Out-Null
}

# Copiază rapoartele de acoperire din containere
Write-Host "Copying coverage reports from containers..."
docker cp server-test:/app/coverage/. ./coverage/server/ 2>$null
docker cp client-test:/app/coverage/. ./coverage/client/ 2>$null

# Verifică și afișează informații despre acoperire
if (Test-Path "coverage/server/lcov-report/index.html") {
    Write-Host "Server coverage report generated successfully." -ForegroundColor Green
} else {
    Write-Host "Server coverage report not found." -ForegroundColor Yellow
}

if (Test-Path "coverage/client/lcov-report/index.html") {
    Write-Host "Client coverage report generated successfully." -ForegroundColor Green
} else {
    Write-Host "Client coverage report not found." -ForegroundColor Yellow
}

# Setează variabilele pentru raportul HTML
$serverStatus = if ($SERVER_EXIT_CODE -eq 0) { "PASSED" } else { "FAILED" }
$serverClass = if ($SERVER_EXIT_CODE -eq 0) { "status-passed" } else { "status-failed" }

$clientStatus = if ($CLIENT_EXIT_CODE -eq 0) { "PASSED" } else { "FAILED" }
$clientClass = if ($CLIENT_EXIT_CODE -eq 0) { "status-passed" } else { "status-failed" }

$integrationStatus = if ($INTEGRATION_EXIT_CODE -eq 0) { "PASSED" } else { "FAILED" }
$integrationClass = if ($INTEGRATION_EXIT_CODE -eq 0) { "status-passed" } else { "status-failed" }

# Creează un raport HTML combinat
$htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Combined Test Coverage Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        h1, h2 {
            color: #333;
        }
        .report-links {
            margin: 20px 0;
            display: flex;
            gap: 20px;
        }
        .report-link {
            display: inline-block;
            padding: 10px 15px;
            background-color: #4c51bf;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .report-link:hover {
            background-color: #434190;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .status-passed {
            color: green;
            font-weight: bold;
        }
        .status-failed {
            color: red;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Raport de Acoperire cu Teste - Aplicație de Monitorizare a Sănătății Mentale</h1>
        
        <div class="report-links">
            <a href="../server/lcov-report/index.html" class="report-link">Raport Detaliat Server</a>
            <a href="../client/lcov-report/index.html" class="report-link">Raport Detaliat Client</a>
        </div>
        
        <h2>Sumarul Testelor</h2>
        <table>
            <thead>
                <tr>
                    <th>Componentă</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Server Tests</td>
                    <td class="$serverClass">$serverStatus</td>
                </tr>
                <tr>
                    <td>Client Tests</td>
                    <td class="$clientClass">$clientStatus</td>
                </tr>
                <tr>
                    <td>Integration Tests</td>
                    <td class="$integrationClass">$integrationStatus</td>
                </tr>
            </tbody>
        </table>
        
        <p>Raport generat la $(Get-Date)</p>
    </div>
</body>
</html>
"@

$htmlContent | Out-File -FilePath "coverage/combined/index.html" -Encoding utf8
Write-Host "Coverage report generated at coverage/combined/index.html" -ForegroundColor Green

# Curăță după teste
Write-Section "Cleaning up containers"
docker-compose -f docker-compose.test.yml down

# Afișează rezultatele testelor
Write-Section "Test Results"
if ($SERVER_EXIT_CODE -eq 0) {
    Write-Host "Server tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "Server tests: FAILED" -ForegroundColor Red
}

if ($CLIENT_EXIT_CODE -eq 0) {
    Write-Host "Client tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "Client tests: FAILED" -ForegroundColor Red
}

if ($INTEGRATION_EXIT_CODE -eq 0) {
    Write-Host "Integration tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "Integration tests: FAILED" -ForegroundColor Red
}

if (($SERVER_EXIT_CODE -eq 0) -and ($CLIENT_EXIT_CODE -eq 0) -and ($INTEGRATION_EXIT_CODE -eq 0)) {
    Write-Host "`n=============================================" -ForegroundColor Green
    Write-Host "          ALL TESTS PASSED                  " -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n=============================================" -ForegroundColor Red
    Write-Host "          SOME TESTS FAILED                 " -ForegroundColor Red
    Write-Host "=============================================" -ForegroundColor Red
    exit 1
}