#!/bin/bash

# Fix script to clear drizzle cache and ensure correct database

echo "🔧 Fixing database configuration..."

cd backend

# Clear any cached drizzle data
echo "Clearing drizzle cache..."
rm -rf .drizzle 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Verify .env file
echo "Checking .env configuration..."
if grep -q "social_app" .env 2>/dev/null; then
    echo "⚠️  Found 'social_app' in .env, fixing..."
    sed -i 's/social_app/socialphotogame/g' .env
fi

# Check for any cached environment files
for env_file in .env.local .env.production .env.development; do
    if [ -f "$env_file" ] && grep -q "social_app" "$env_file"; then
        echo "⚠️  Found 'social_app' in $env_file, fixing..."
        sed -i 's/social_app/socialphotogame/g' "$env_file"
    fi
done

# Display current DATABASE_URL
echo ""
echo "Current DATABASE_URL:"
grep DATABASE_URL .env 2>/dev/null || echo "  Not found in .env"

echo ""
echo "✅ Fix complete!"
echo ""
echo "Now try running migrations with:"
echo "  cd backend && pnpm db:push"
