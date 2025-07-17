#!/bin/bash
cd "$(dirname "$0")"
export PORT=3500
bun src/build.ts
echo "Starting server on port $PORT..."
bun src/app.ts 