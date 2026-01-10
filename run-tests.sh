#!/bin/bash
# Test runner script - makes it easy to run tests from anywhere

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Bus Charter Website Test Suite${NC}"
echo "=================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Parse command line arguments
TEST_TYPE=${1:-"all"}

case $TEST_TYPE in
    "all"|"")
        echo -e "${GREEN}▶ Running all tests...${NC}"
        npm test
        ;;
    "watch")
        echo -e "${GREEN}▶ Running tests in watch mode...${NC}"
        npm run test:watch
        ;;
    "coverage")
        echo -e "${GREEN}▶ Running tests with coverage...${NC}"
        npm run test:coverage
        ;;
    "ci")
        echo -e "${GREEN}▶ Running tests in CI mode...${NC}"
        npm run test:ci
        ;;
    "help"|"-h"|"--help")
        echo "Usage: ./run-tests.sh [option]"
        echo ""
        echo "Options:"
        echo "  all       Run all tests (default)"
        echo "  watch     Run tests in watch mode"
        echo "  coverage  Run tests with coverage report"
        echo "  ci        Run tests in CI mode"
        echo "  help      Show this help message"
        echo ""
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $TEST_TYPE${NC}"
        echo "Run './run-tests.sh help' for usage information"
        exit 1
        ;;
esac

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
fi

exit $TEST_EXIT_CODE
