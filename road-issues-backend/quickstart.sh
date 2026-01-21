#!/bin/bash

# Quick Start Script for Road Issues API Backend
# This script helps you get started quickly with the Road Issues API

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ Road Issues API - Quick Start Guide        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"
}

print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker is not installed${NC}"
        echo "  Install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}✗ Docker Compose is not installed${NC}"
        echo "  Install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed"
}

check_java() {
    if ! command -v java &> /dev/null; then
        echo -e "${RED}✗ Java is not installed${NC}"
        echo "  Install Java 17+ from: https://www.oracle.com/java/technologies/downloads/"
        exit 1
    fi
    JAVA_VERSION=$(java -version 2>&1 | grep -oP 'version "\K[0-9]+' | head -1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        echo -e "${RED}✗ Java 17+ is required (you have Java $JAVA_VERSION)${NC}"
        exit 1
    fi
    print_success "Java 17+ is installed (version $JAVA_VERSION)"
}

check_maven() {
    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}✗ Maven is not installed${NC}"
        echo "  Install Maven from: https://maven.apache.org/install.html"
        exit 1
    fi
    print_success "Maven is installed"
}

start_docker_compose() {
    print_section "Starting with Docker Compose (Recommended)"
    echo "This will:"
    echo "  1. Build the Spring Boot application image"
    echo "  2. Start PostgreSQL database"
    echo "  3. Start the API server"
    echo "  4. Run database migrations automatically"
    echo ""
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Building and starting containers..."
        docker-compose up --build
        
        echo ""
        print_success "Application started successfully!"
        echo ""
        print_info "API is available at: http://localhost:8080/api"
        print_info "Swagger UI: http://localhost:8080/api/swagger-ui.html"
        print_info "Statistics: http://localhost:8080/api/stats"
        echo ""
        print_info "To stop: Press Ctrl+C"
        print_info "To remove containers: docker-compose down"
    fi
}

start_maven_local() {
    print_section "Starting with Maven (Local Development)"
    echo "This requires:"
    echo "  - PostgreSQL running on localhost:5432"
    echo "  - Database 'road_issues_db' created"
    echo "  - User 'road_issues_user' with password 'securePassword123!'"
    echo ""
    
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Building project..."
        mvn clean install
        
        print_info "Starting Spring Boot application..."
        mvn spring-boot:run
        
        echo ""
        print_success "Application started successfully!"
        echo ""
        print_info "API is available at: http://localhost:8080/api"
        print_info "Swagger UI: http://localhost:8080/api/swagger-ui.html"
    fi
}

show_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "  1) Start with Docker Compose (Recommended - No local DB needed)"
    echo "  2) Start with Maven locally (Requires PostgreSQL)"
    echo "  3) Run API tests (requires running API)"
    echo "  4) View Documentation"
    echo "  5) Exit"
    echo ""
    read -p "Select option (1-5): " choice
    
    case $choice in
        1)
            check_docker
            check_docker_compose
            start_docker_compose
            ;;
        2)
            check_java
            check_maven
            start_maven_local
            ;;
        3)
            print_section "Running API Tests"
            if [ -f "test-api.sh" ]; then
                chmod +x test-api.sh
                ./test-api.sh
            else
                echo -e "${RED}✗ test-api.sh not found${NC}"
            fi
            ;;
        4)
            show_documentation
            ;;
        5)
            echo -e "\n${GREEN}Goodbye!${NC}\n"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            show_menu
            ;;
    esac
}

show_documentation() {
    echo ""
    echo "Documentation Files:"
    echo ""
    echo "  1) README.md - Complete feature documentation"
    echo "  2) INSTALL.md - Installation and setup guide"
    echo "  3) PROJECT_STRUCTURE.md - Architecture documentation"
    echo "  4) IMPLEMENTATION_SUMMARY.md - What was implemented"
    echo "  5) FILE_LISTING.md - List of all files"
    echo "  6) Back to main menu"
    echo ""
    read -p "Select documentation (1-6): " doc_choice
    
    case $doc_choice in
        1) less README.md ;;
        2) less INSTALL.md ;;
        3) less PROJECT_STRUCTURE.md ;;
        4) less IMPLEMENTATION_SUMMARY.md ;;
        5) less FILE_LISTING.md ;;
        6) show_menu ;;
        *) echo -e "${RED}Invalid option${NC}"; show_documentation ;;
    esac
}

# Main script
print_header

print_section "Checking Prerequisites"
check_docker
check_docker_compose
echo ""

print_section "Quick Commands"
echo ""
echo "Start application:"
echo "  ${GREEN}docker-compose up --build${NC}"
echo ""
echo "View logs:"
echo "  ${GREEN}docker-compose logs -f road-issues-api${NC}"
echo ""
echo "Stop application:"
echo "  ${GREEN}docker-compose down${NC}"
echo ""
echo "Test API:"
echo "  ${GREEN}bash test-api.sh${NC}"
echo ""
echo "View API documentation:"
echo "  ${GREEN}http://localhost:8080/api/swagger-ui.html${NC}"
echo ""

show_menu
