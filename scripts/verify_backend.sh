#!/bin/bash

BASE_URL="http://localhost:3000"
ASSETS_DIR="test_assets"

echo "Testing Compressor..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -F "file=@$ASSETS_DIR/test_video.mp4" -F "level=medium" "$BASE_URL/api/tools/compressor")
if [ "$response" -eq 200 ]; then
  echo "Compressor Success"
else
  echo "Compressor Failed: $response"
  exit 1
fi

echo "Testing Chopper..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -F "file=@$ASSETS_DIR/test_audio.mp3" -F "minutes=1" "$BASE_URL/api/tools/chop")
if [ "$response" -eq 200 ]; then
  echo "Chopper Success"
else
  echo "Chopper Failed: $response"
  exit 1
fi

echo "Testing Converter..."
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -F "file=@$ASSETS_DIR/test_video.mp4" -F "format=mp3" "$BASE_URL/api/tools/convert")
if [ "$response" -eq 200 ]; then
  echo "Converter Success"
else
  echo "Converter Failed: $response"
  exit 1
fi

echo "ALL TESTS PASSED"
