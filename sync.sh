#!/bin/bash

# Function to display an error message and exit
error_exit() {
  echo "Error: $1" >&2
  exit 1
}

# Function to check if a command is available
check_command() {
  command -v "$1" >/dev/null 2>&1 || error_exit "$1 is not installed or not available in PATH."
}

# Function to perform migrations based on the argument
run_migration() {
  if [[ $1 == "fresh" ]]; then
    echo "Running migrate:fresh..."
    php artisan migrate:fresh --seed || error_exit "Migrate fresh failed."
  else
    echo "Running migrate..."
    php artisan migrate || error_exit "Migrate failed."
  fi
}

# Function to display script usage
usage() {
  echo "Usage: $0 [fresh|migrate]"
  echo " - fresh: Run migrate:fresh with seeding."
  echo " - migrate: Run ordinary migrate."
  echo "If no argument is supplied, no migration will be performed."
  exit 1
}

# Check required commands
check_command git
check_command composer
check_command php
check_command bun

# Reset local code to match origin/main
echo "Resetting local changes to origin/main..."
git reset --hard HEAD || error_exit "Failed to reset to origin/main."

# Fetch the latest code from the main branch
echo "Fetching the latest code from the main branch..."
git pull origin main --force || error_exit "Failed to fetch from the main branch."

# Install dependencies with Composer
echo "Installing Composer dependencies..."
composer install --prefer-dist --no-interaction || error_exit "Composer install failed."

# Install bun dependencies
echo "Running 'bun install'..."
bun install || error_exit "Bun install failed."

# Generate Ziggy routes
echo "Generating Ziggy routes..."
php artisan ziggy:generate || error_exit "Failed to generate Ziggy routes."

# Run the build process using bun
echo "Running 'bun run build'..."
bun run build || error_exit "Bun build failed."

# Handle arguments and run migrations accordingly
if [[ $# -eq 1 ]]; then
  case $1 in
    fresh) run_migration "fresh" ;;
    migrate) run_migration "migrate" ;;
    *) echo "Invalid argument: $1"; usage ;;
  esac
elif [[ $# -gt 1 ]]; then
  echo "Error: Too many arguments provided."
  usage
else
  echo "No migration option provided. Skipping migrations..."
fi

echo "Script executed successfully."