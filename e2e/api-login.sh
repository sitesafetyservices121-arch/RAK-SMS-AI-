#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# IMPORTANT: Replace these with your actual credentials
ADMIN_EMAIL="ruan@sitesafety.services"
ADMIN_PASSWORD="50700Koen*"
CLIENT_EMAIL="info@sitesafety.services"
CLIENT_PASSWORD="50700Koen*"

API_URL="http://localhost:3000/api/auth/login"
MAX_RETRIES=10
RETRY_DELAY=3

# --- Helper Functions ---
log_info() {
  echo "INFO: $1"
}

log_success() {
  echo "✅ SUCCESS: $1"
}

log_error() {
  echo "❌ ERROR: $1" >&2
}

cleanup() {
  log_info "Cleaning up..."
  if [ -n "$SERVER_PID" ]; then
    kill $SERVER_PID
    log_info "Server process stopped."
  fi
}

# --- Main Logic ---
trap cleanup EXIT

log_info "Starting the dev server in the background..."
npm run dev &
SERVER_PID=$!

log_info "Waiting for the server to be ready..."
retries=0
until curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login | grep -q "200"; do
  if [ $retries -ge $MAX_RETRIES ]; then
    log_error "Server did not start in time. Aborting."
    exit 1
  fi
  log_info "Server not ready yet. Retrying in $RETRY_DELAY seconds... ($((retries+1))/$MAX_RETRIES)"
  sleep $RETRY_DELAY
  retries=$((retries+1))
done

log_info "Server is up and running."

# --- Test Cases ---
test_login() {
  local email=$1
  local password=$2
  local user_type=$3

  log_info "Attempting to log in as $user_type..."
  
  response_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

  if [ "$response_code" -eq 200 ]; then
    log_success "$user_type login successful."
  else
    log_error "$user_type login failed with status code: $response_code"
    exit 1 # Exit on first failure
  fi
}

# Run tests
test_login "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "Admin"
test_login "$CLIENT_EMAIL" "$CLIENT_PASSWORD" "Client"

log_info "All API login tests passed."
exit 0
