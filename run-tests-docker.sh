#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${YELLOW}"
echo "============================================="
echo "    DOCKER TESTS - MENTAL HEALTH APP    "
echo "============================================="
echo -e "${NC}"

# Function to print section headers
print_section() {
    echo -e "${GREEN}"
    echo "---------------------------------------------"
    echo "  $1"
    echo "---------------------------------------------"
    echo -e "${NC}"
}

# Build and start the test containers
print_section "Starting test containers"
docker-compose -f docker-compose.test.yml build
docker-compose -f docker-compose.test.yml up -d mongodb-test

# Run server tests
print_section "Running server tests"
docker-compose -f docker-compose.test.yml up --exit-code-from server-test server-test
SERVER_EXIT_CODE=$?

# Run client tests
print_section "Running client tests"
docker-compose -f docker-compose.test.yml up --exit-code-from client-test client-test
CLIENT_EXIT_CODE=$?

# Run integration tests
print_section "Running integration tests"
docker-compose -f docker-compose.test.yml up --exit-code-from integration-test integration-test
INTEGRATION_EXIT_CODE=$?

# Generate coverage report
print_section "Generating coverage report"
chmod +x ./generate-coverage-report.sh
./generate-coverage-report.sh

# Clean up
print_section "Cleaning up containers"
docker-compose -f docker-compose.test.yml down

# Print test results
print_section "Test Results"
if [ $SERVER_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Server tests: PASSED${NC}"
else
    echo -e "${RED}Server tests: FAILED${NC}"
fi

if [ $CLIENT_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Client tests: PASSED${NC}"
else
    echo -e "${RED}Client tests: FAILED${NC}"
fi

if [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}Integration tests: PASSED${NC}"
else
    echo -e "${RED}Integration tests: FAILED${NC}"
fi

# Overall result
if [[ $SERVER_EXIT_CODE -eq 0 && $CLIENT_EXIT_CODE -eq 0 && $INTEGRATION_EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}"
    echo "============================================="
    echo "          ALL TESTS PASSED                  "
    echo "============================================="
    echo -e "${NC}"
    exit 0
else
    echo -e "${RED}"
    echo "============================================="
    echo "          SOME TESTS FAILED                 "
    echo "============================================="
    echo -e "${NC}"
    exit 1
fi