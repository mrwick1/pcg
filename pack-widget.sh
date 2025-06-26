#!/bin/bash
# Custom widget packing script with random names

echo "🔧 Custom Widget Packing Script"
echo "================================"

# Step 1: Remove all existing files from dist directory
echo "🗑️ Removing ALL existing files from widget/dist/"
rm -rf widget/dist/*

# Step 2: Remove old files from widget app directory
echo "🗑️ Removing old css and js folders from widget/app/"
rm -rf widget/app/css widget/app/js

# Step 3: Copy latest files to widget app directory  
echo "📁 Copying latest css and js folders to widget/app/"
cp -r css js widget/app/

# Step 4: Validate widget structure
echo "✅ Validating widget structure..."
cd widget
zet validate

if [ $? -ne 0 ]; then
    echo "❌ Widget validation failed!"
    exit 1
fi

# Step 5: Pack widget
echo "📦 Packing widget..."
zet pack

if [ $? -ne 0 ]; then
    echo "❌ Widget packing failed!"
    exit 1
fi

# Step 6: Create random filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RANDOM_ID=$(openssl rand -hex 4)
NEW_NAME="widget_${TIMESTAMP}_${RANDOM_ID}.zip"

# Step 7: Rename the widget.zip file
echo "🏷️ Renaming widget.zip to ${NEW_NAME}"
mv dist/widget.zip "dist/${NEW_NAME}"

echo "✅ Widget packed successfully as: dist/${NEW_NAME}"
echo "📋 Full path: $(pwd)/dist/${NEW_NAME}"
echo "🎯 Install this file in Zoho Creator to avoid cache issues"