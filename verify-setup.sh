#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║    SUPABASE SETUP VERIFICATION SCRIPT - COMPREHENSIVE       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

BASE_URL="http://localhost:3000"
ERRORS=0
WARNINGS=0

# Function to print results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
  else
    echo -e "${RED}❌ $2${NC}"
    ERRORS=$((ERRORS + 1))
  fi
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  WARNINGS=$((WARNINGS + 1))
}

# Test 1: Dev Server Health
echo -e "\n${BLUE}1️⃣  DEV SERVER HEALTH${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -s "$BASE_URL/api/clusters" > /dev/null 2>&1; then
  print_result 0 "API server responding on $BASE_URL"
else
  print_result 1 "API server not responding"
  echo "   Run: npm run dev"
  exit 1
fi

# Test 2: Clusters Endpoint
echo -e "\n${BLUE}2️⃣  CLUSTERS ENDPOINT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CLUSTERS=$(curl -s "$BASE_URL/api/clusters")
CLUSTER_COUNT=$(echo "$CLUSTERS" | jq 'length' 2>/dev/null)

if [ "$CLUSTER_COUNT" -gt 0 ]; then
  print_result 0 "Found $CLUSTER_COUNT clusters"
else
  print_result 1 "No clusters found"
fi

# Test 3: Email Endpoints
echo -e "\n${BLUE}3️⃣  EMAILS ENDPOINTS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FIRST_CLUSTER=$(echo "$CLUSTERS" | jq -r '.[0].id' 2>/dev/null)

if [ -n "$FIRST_CLUSTER" ] && [ "$FIRST_CLUSTER" != "null" ]; then
  EMAILS=$(curl -s "$BASE_URL/api/clusters/$FIRST_CLUSTER/emails")
  EMAIL_COUNT=$(echo "$EMAILS" | jq 'length' 2>/dev/null)
  
  if [ "$EMAIL_COUNT" -gt 0 ]; then
    print_result 0 "Cluster $FIRST_CLUSTER has $EMAIL_COUNT emails"
  else
    print_result 1 "No emails found for cluster $FIRST_CLUSTER"
  fi
else
  print_result 1 "Could not get first cluster"
fi

# Test 4: Email Structure
echo -e "\n${BLUE}4️⃣  EMAIL DATA STRUCTURE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SAMPLE_EMAIL=$(echo "$EMAILS" | jq '.[0]' 2>/dev/null)
REQUIRED_FIELDS=("id" "cluster_id" "sender" "subject" "body" "timestamp" "is_read")

for field in "${REQUIRED_FIELDS[@]}"; do
  if echo "$SAMPLE_EMAIL" | jq -e ".$field" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Field '$field' present"
  else
    echo -e "${RED}❌${NC} Field '$field' missing"
    ERRORS=$((ERRORS + 1))
  fi
done

# Test 5: Analytics Endpoint
echo -e "\n${BLUE}5️⃣  ANALYTICS ENDPOINT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ANALYTICS=$(curl -s "$BASE_URL/api/analytics/overview")
TOTAL_EMAILS=$(echo "$ANALYTICS" | jq '.totalEmails' 2>/dev/null)

if [ "$TOTAL_EMAILS" -gt 0 ]; then
  print_result 0 "Analytics reports $TOTAL_EMAILS total emails"
else
  print_result 1 "Analytics endpoint not working"
fi

# Test 6: Multiple Clusters
echo -e "\n${BLUE}6️⃣  MULTI-CLUSTER EMAIL VERIFICATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CLUSTERS_TO_TEST=("tech-001" "supp-001" "feat-001" "bill-001")
TOTAL_EMAILS_SUM=0

for CLUSTER in "${CLUSTERS_TO_TEST[@]}"; do
  EMAILS=$(curl -s "$BASE_URL/api/clusters/$CLUSTER/emails")
  COUNT=$(echo "$EMAILS" | jq 'length' 2>/dev/null)
  
  if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅${NC} $CLUSTER: $COUNT emails"
    TOTAL_EMAILS_SUM=$((TOTAL_EMAILS_SUM + COUNT))
  else
    echo -e "${RED}❌${NC} $CLUSTER: No emails"
  fi
done

echo "   Tested 4 clusters: $TOTAL_EMAILS_SUM total emails"

# Test 7: Different Emails Per Cluster
echo -e "\n${BLUE}7️⃣  CLUSTER UNIQUENESS CHECK${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TECH_FIRST=$(curl -s "$BASE_URL/api/clusters/tech-001/emails" | jq -r '.[0].id' 2>/dev/null)
SUPP_FIRST=$(curl -s "$BASE_URL/api/clusters/supp-001/emails" | jq -r '.[0].id' 2>/dev/null)

if [ "$TECH_FIRST" != "$SUPP_FIRST" ]; then
  print_result 0 "Different clusters show different emails"
else
  print_warning "Same first email in different clusters (might be coincidence)"
fi

# Test 8: Build Status
echo -e "\n${BLUE}8️⃣  BUILD STATUS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".next" ]; then
  print_result 0 "Build artifacts exist"
else
  print_warning "No .next directory - run 'npm run build' to generate build artifacts"
fi

# Test 9: Environment Check
echo -e "\n${BLUE}9️⃣  ENVIRONMENT CONFIGURATION${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null; then
  print_result 0 "NEXT_PUBLIC_SUPABASE_URL configured"
else
  print_result 1 "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
fi

if grep -q "NEXT_PUBLIC_ENABLE_MOCK_DATA=true" .env.local 2>/dev/null; then
  print_result 0 "Mock data blending enabled"
else
  print_warning "Mock data blending may be disabled"
fi

# Test 10: Summary
echo -e "\n${BLUE}🔟 SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ($WARNINGS warnings - see above)${NC}"
  fi
  echo -e "\n${GREEN}Status: 🟢 FULLY OPERATIONAL${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS ERRORS FOUND${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ($WARNINGS warnings)${NC}"
  fi
  echo -e "\n${RED}Status: 🔴 NEEDS ATTENTION${NC}"
  exit 1
fi

echo ""
