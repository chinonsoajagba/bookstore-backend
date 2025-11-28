#!/bin/bash

# CST3144 Coursework - Prepare Submission Zip Script
# This script creates a zip file for submission, excluding node_modules

set -e

echo "=== CST3144 Backend Submission Zip Preparation ==="
echo ""

# Configuration
PROJECT_NAME="bookstore-backend"
MAX_SIZE_MB=10
OUTPUT_DIR="$(dirname "$0")"
ZIP_NAME="${PROJECT_NAME}-submission.zip"

# Navigate to project directory
cd "$OUTPUT_DIR"

# Remove node_modules if accidentally present in zip area
if [ -d "node_modules" ]; then
    echo "Warning: node_modules found. It will be excluded from zip."
fi

# Create exports directory if it doesn't exist
mkdir -p data/exports

# Export MongoDB data if mongosh is available
if command -v mongosh &> /dev/null; then
    echo "Exporting MongoDB data..."
    # Note: User should run mongosh export manually or use MongoDB Compass
    echo "Please use MongoDB Compass to export lessons.json and orders.json to data/exports/"
fi

# Create the zip file
echo ""
echo "Creating zip file: $ZIP_NAME"
echo ""

# Remove old zip if exists
rm -f "$ZIP_NAME"

# Create zip excluding node_modules, .git, .env
zip -r "$ZIP_NAME" . \
    -x "node_modules/*" \
    -x ".git/*" \
    -x ".env" \
    -x "*.zip" \
    -x ".DS_Store" \
    -x "Thumbs.db"

# Check zip size
ZIP_SIZE=$(du -m "$ZIP_NAME" | cut -f1)
echo ""
echo "Zip file created: $ZIP_NAME"
echo "Size: ${ZIP_SIZE}MB"

if [ "$ZIP_SIZE" -gt "$MAX_SIZE_MB" ]; then
    echo ""
    echo "WARNING: Zip file exceeds ${MAX_SIZE_MB}MB limit!"
    echo "Consider downscaling images in the images/ folder."
    
    if command -v mogrify &> /dev/null; then
        echo ""
        echo "ImageMagick detected. To downscale images, run:"
        echo "  mogrify -resize 50% images/*.jpg"
    else
        echo ""
        echo "Large images that may need downscaling:"
        ls -lhS images/*.jpg 2>/dev/null | head -5
    fi
else
    echo "✓ Zip size is within ${MAX_SIZE_MB}MB limit"
fi

echo ""
echo "=== Zip Contents ==="
unzip -l "$ZIP_NAME" | tail -20

echo ""
echo "=== Done ==="
echo "Submission zip ready: $OUTPUT_DIR/$ZIP_NAME"
