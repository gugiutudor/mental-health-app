// tests/run-all-tests.sh
#!/bin/bash

# Colorare output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcție pentru afișarea banner-ului
print_banner() {
    echo -e "${YELLOW}"
    echo "============================================="
    echo "        TESTE APLICAȚIE SĂNĂTATE MENTALĂ    "
    echo "============================================="
    echo -e "${NC}"
}

# Funcție pentru afișarea rezultatelor
print_section() {
    echo -e "${GREEN}"
    echo "---------------------------------------------"
    echo "  $1"
    echo "---------------------------------------------"
    echo -e "${NC}"
}

# Banner inițial
print_banner

# Instalare dependențe (dacă este necesar)
print_section "Instalare dependențe"
npm run setup:test

# Rulare teste unitare backend
print_section "Rulare teste unitare backend"
npm test

# Rulare teste unitare frontend
print_section "Rulare teste unitare frontend"
npm run test:client

# Rulare teste de integrare
print_section "Rulare teste de integrare"
npm run test:integration

# Pornire servere pentru teste end-to-end
print_section "Pornire servere pentru teste end-to-end"
echo "Pornire backend în background..."
npm run dev &
SERVER_PID=$!
echo "Backend pornit cu PID: $SERVER_PID"

echo "Așteptare pornire backend (5 secunde)..."
sleep 5

echo "Pornire frontend în background..."
cd client && npm start &
CLIENT_PID=$!
echo "Frontend pornit cu PID: $CLIENT_PID"

echo "Așteptare pornire frontend (10 secunde)..."
sleep 10

# Rulare teste end-to-end
print_section "Rulare teste end-to-end"
cd .. && npm run test:e2e

# Oprire servere
print_section "Curățare și oprire servere"
echo "Oprire server frontend (PID: $CLIENT_PID)..."
kill $CLIENT_PID

echo "Oprire server backend (PID: $SERVER_PID)..."
kill $SERVER_PID

# Generare raport acoperire
print_section "Generare raport acoperire cu cod"
npm run test:coverage
npm run test:client:coverage

# Final
echo -e "${GREEN}"
echo "============================================="
echo "        TOATE TESTELE AU FOST RULATE        "
echo "============================================="
echo -e "${NC}"