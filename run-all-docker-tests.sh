#!/bin/bash

# Make scripts executable
chmod +x run-tests-docker.sh
chmod +x run-e2e-tests-docker.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${YELLOW}"
echo "============================================="
echo "    RUNNING ALL TESTS IN DOCKER    "
echo "============================================="
echo -e "${NC}"

# Run unit and integration tests
echo -e "${GREEN}Running unit and integration tests...${NC}"
./run-tests-docker.sh
UNIT_INTEGRATION_EXIT_CODE=$?

# Run E2E tests
echo -e "${GREEN}Running E2E tests...${NC}"
./run-e2e-tests-docker.sh
E2E_EXIT_CODE=$?

# Print overall results
echo -e "${YELLOW}"
echo "============================================="
echo "    OVERALL TESTING RESULTS    "
echo "============================================="
echo -e "${NC}"

if [[ $UNIT_INTEGRATION_EXIT_CODE -eq 0 && $E2E_EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}Unit & Integration Tests: PASSED${NC}"
    echo -e "${GREEN}E2E Tests: PASSED${NC}"
    echo -e "${GREEN}"
    echo "============================================="
    echo "          ALL TESTS PASSED                  "
    echo "============================================="
    echo -e "${NC}"
    exit 0
else
    if [ $UNIT_INTEGRATION_EXIT_CODE -ne 0 ]; then
        echo -e "${RED}Unit & Integration Tests: FAILED${NC}"
    else
        echo -e "${GREEN}Unit & Integration Tests: PASSED${NC}"
    fi
    
    if [ $E2E_EXIT_CODE -ne 0 ]; then
        echo -e "${RED}E2E Tests: FAILED${NC}"
    else
        echo -e "${GREEN}E2E Tests: PASSED${NC}"
    fi
    
    echo -e "${RED}"
    echo "============================================="
    echo "          SOME TESTS FAILED                 "
    echo "============================================="
    echo -e "${NC}"
    exit 1
fi