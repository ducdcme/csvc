#!/bin/bash

# ==============================
# CONFIG
# ==============================

BASE_URL="https://csvcmc.com/user/incident-work"
TOKEN="s%3AKtrmlrmgTVf7CtJn9RAGxQ-DoLtU0pws.GhqTFMWI%2FPH0m06JWTQuV4BxMFTEepRT95MQbfdVREI"   # 🔥 thay bằng token thật

HEADER_AUTH="Authorization: Bearer $TOKEN"
HEADER_JSON="Content-Type: application/json"

echo "===== START TEST INCIDENT FLOW ====="

# ==============================
# 1. CREATE INCIDENT (INTERNAL)
# ==============================

echo "👉 Creating incident..."

CREATE_RES=$(curl -s -X POST "$BASE_URL" \
  -H "$HEADER_AUTH" \
  -H "$HEADER_JSON" \
  -d '{
    "title": "Test Incident",
    "description": "Test flow",
    "work_type": "INTERNAL",
    "due_date": "2026-06-10"
  }')

echo $CREATE_RES

INCIDENT_ID=$(echo $CREATE_RES | grep -o '"id":[0-9]*' | head -1 | cut -d ':' -f2)

echo "✔ Incident ID: $INCIDENT_ID"

# ==============================
# 2. APPROVE
# ==============================

echo "👉 Approving..."

curl -s -X PUT "$BASE_URL/$INCIDENT_ID/approve" \
  -H "$HEADER_AUTH"

# ==============================
# 3. START WORK
# ==============================

echo "👉 Starting work..."

curl -s -X PUT "$BASE_URL/$INCIDENT_ID/start" \
  -H "$HEADER_AUTH"

# ==============================
# 4. GET CHECKLIST
# ==============================

echo "👉 Getting detail..."

DETAIL=$(curl -s -X GET "$BASE_URL/$INCIDENT_ID" \
  -H "$HEADER_AUTH")

echo $DETAIL

# Lấy item_id đầu tiên
ITEM_ID=$(echo $DETAIL | grep -o '"id":[0-9]*' | head -2 | tail -1 | cut -d ':' -f2)

echo "✔ Item ID: $ITEM_ID"

# ==============================
# 5. COMPLETE ITEM
# ==============================

echo "👉 Completing checklist item..."

curl -s -X POST "$BASE_URL/checklist/$ITEM_ID/complete" \
  -H "$HEADER_AUTH" \
  -H "$HEADER_JSON" \
  -d '{
    "files": [1],
    "note": "Test done"
  }'

# ==============================
# 6. CLOSE (có thể fail nếu chưa đủ checklist)
# ==============================

echo "👉 Closing..."

curl -s -X PUT "$BASE_URL/$INCIDENT_ID/close" \
  -H "$HEADER_AUTH"

echo ""
echo "===== DONE ====="