#!/bin/bash

# ألوان للتيرمينال
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN}      MOTABEA Development Server${NC}"
echo -e "${CYAN}====================================${NC}"
echo

# قتل العمليات السابقة
echo -e "${YELLOW}تنظيف العمليات السابقة...${NC}"
pkill -f "node.*server/index.js" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

# انتظار قليل
sleep 2

# تشغيل سكريپت التطوير
echo -e "${BLUE}تشغيل خوادم التطوير...${NC}"
node start-dev.js
