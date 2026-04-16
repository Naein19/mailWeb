#!/bin/bash

# Database Diagnostic Script
# This script checks if your Supabase data is accessible from the web

echo "🔍 Supabase Database Connectivity Test"
echo "======================================="
echo ""

# Test 1: Check API Endpoint
echo "Test 1: Checking /api/clusters endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/clusters)
CLUSTER_COUNT=$(echo "$RESPONSE" | jq 'length' 2>/dev/null)

if [ -z "$CLUSTER_COUNT" ] || [ "$CLUSTER_COUNT" -eq 0 ]; then
    echo "❌ No clusters returned from API"
    echo "Response: $RESPONSE"
else
    echo "✅ Found $CLUSTER_COUNT clusters"
    echo "Sample: $(echo "$RESPONSE" | jq '.[0]' 2>/dev/null)"
fi

echo ""
echo "Test 2: Checking /api/analytics/overview endpoint..."
RESPONSE=$(curl -s http://localhost:3000/api/analytics/overview)
if echo "$RESPONSE" | jq . >/dev/null 2>&1; then
    echo "✅ Analytics endpoint working"
    echo "Response: $RESPONSE"
else
    echo "❌ Analytics endpoint error"
    echo "Response: $RESPONSE"
fi

echo ""
echo "Test 3: Environment Variables"
echo "SUPABASE_URL: $SUPABASE_URL"
echo "SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..." 
echo "NEXT_PUBLIC_ENABLE_MOCK_DATA: $NEXT_PUBLIC_ENABLE_MOCK_DATA"

echo ""
echo "✨ Diagnostics complete!"
