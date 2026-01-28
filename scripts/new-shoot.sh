#!/bin/bash

# ==============================================================================
# NEW SHOOT SETUP SCRIPT
# ==============================================================================
# Usage: ./scripts/new-shoot.sh "Event Name" "partner-slug"
#
# This script sets up a new shoot by:
# 1. Copying template files to the app directory
# 2. Creating the participants photo directory
# 3. Updating placeholders with your event name
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Help message
show_help() {
    echo ""
    echo "Usage: $0 \"Event Name\" \"partner-slug\""
    echo ""
    echo "Arguments:"
    echo "  Event Name    Full event name (e.g., \"NWSL Media Day 2026\")"
    echo "  partner-slug  URL-safe partner name (e.g., \"panini\")"
    echo ""
    echo "Example:"
    echo "  $0 \"NBA All-Star Weekend 2026\" \"topps\""
    echo ""
}

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    show_help
    exit 1
fi

EVENT_NAME="$1"
PARTNER_SLUG="$2"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   NEW SHOOT SETUP${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Event: ${GREEN}$EVENT_NAME${NC}"
echo -e "Partner: ${GREEN}$PARTNER_SLUG${NC}"
echo ""

# Confirm
read -p "Continue with setup? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Setting up new shoot...${NC}"
echo ""

# Step 1: Copy config template
echo -e "  [1/4] Copying config template..."
if [ -f "$PROJECT_ROOT/app/config.ts" ]; then
    echo -e "    ${YELLOW}Warning: app/config.ts already exists, backing up...${NC}"
    mv "$PROJECT_ROOT/app/config.ts" "$PROJECT_ROOT/app/config.ts.bak"
fi
cp "$PROJECT_ROOT/template/config.ts" "$PROJECT_ROOT/app/config.ts"
echo -e "    ${GREEN}Created app/config.ts${NC}"

# Step 2: Copy participants template
echo -e "  [2/4] Copying participants template..."
if [ -f "$PROJECT_ROOT/app/data/participants.ts" ]; then
    echo -e "    ${YELLOW}Warning: app/data/participants.ts already exists, backing up...${NC}"
    mv "$PROJECT_ROOT/app/data/participants.ts" "$PROJECT_ROOT/app/data/participants.ts.bak"
fi

# Create data directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/app/data"
cp "$PROJECT_ROOT/template/participants.ts" "$PROJECT_ROOT/app/data/participants.ts"
echo -e "    ${GREEN}Created app/data/participants.ts${NC}"

# Step 3: Create photos directory
echo -e "  [3/4] Creating photos directory..."
mkdir -p "$PROJECT_ROOT/public/participants"
if [ ! -f "$PROJECT_ROOT/public/participants/.gitkeep" ]; then
    touch "$PROJECT_ROOT/public/participants/.gitkeep"
fi
echo -e "    ${GREEN}Created public/participants/${NC}"

# Step 4: Update placeholders in config
echo -e "  [4/4] Updating event name in config..."
sed -i.tmp "s/YOUR EVENT NAME/$EVENT_NAME/g" "$PROJECT_ROOT/app/config.ts"
sed -i.tmp "s/Partner Name/$PARTNER_SLUG/g" "$PROJECT_ROOT/app/config.ts"
rm -f "$PROJECT_ROOT/app/config.ts.tmp"
echo -e "    ${GREEN}Updated config placeholders${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   SETUP COMPLETE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Edit ${BLUE}app/config.ts${NC} with full event details"
echo -e "  2. Edit ${BLUE}app/data/participants.ts${NC} with participant data"
echo -e "  3. Add photos to ${BLUE}public/participants/${NC}"
echo -e "  4. Run ${BLUE}npm run dev${NC} to preview"
echo ""
echo -e "Visit ${BLUE}http://localhost:3000/crew${NC} to see your shoot packet"
echo ""
