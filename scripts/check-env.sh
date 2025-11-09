#!/bin/bash
# Check if required environment variables are set

echo "🔍 Checking environment variables..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "HMAC_SECRET"
)

MISSING=0

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ $var is not set"
        MISSING=1
    else
        echo "✅ $var is set"
    fi
done

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Some required environment variables are missing."
    echo "   Please check your .env file and ensure all required variables are set."
    exit 1
else
    echo ""
    echo "✅ All required environment variables are set!"
fi

