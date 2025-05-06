#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${YELLOW}"
echo "============================================="
echo "    E2E TESTS IN DOCKER - MENTAL HEALTH APP    "
echo "============================================="
echo -e "${NC}"

# Build and start the E2E test environment
echo -e "${GREEN}Building and starting E2E test environment...${NC}"
docker-compose -f docker-compose.e2e.yml build
docker-compose -f docker-compose.e2e.yml up -d mongodb-e2e server-e2e client-e2e selenium-hub chrome

# Wait for services to be fully up and running
echo -e "${GREEN}Waiting for services to start...${NC}"
sleep 15

# Run E2E tests
echo -e "${GREEN}Running E2E tests...${NC}"
docker-compose -f docker-compose.e2e.yml up --exit-code-from e2e-tests e2e-tests
E2E_EXIT_CODE=$?

# Clean up
echo -e "${GREEN}Cleaning up containers...${NC}"
docker-compose -f docker-compose.e2e.yml down

# Print test results
echo -e "${GREEN}E2E Test Results${NC}"
if [ $E2E_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}E2E tests: PASSED${NC}"
    echo -e "${GREEN}"
    echo "============================================="
    echo "          E2E TESTS PASSED                  "
    echo "============================================="
    echo -e "${NC}"
    exit 0
else
    echo -e "${RED}E2E tests: FAILED${NC}"
    echo -e "${RED}"
    echo "============================================="
    echo "          E2E TESTS FAILED                 "
    echo "============================================="
    echo -e "${NC}"
    exit 1
fi