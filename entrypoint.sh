#!/bin/sh

echo "Applying migrations..."
npx prisma migrate deploy

echo "Starting server..."

if [ "$NODE_ENV" = "production" ]; then
  exec node dist/app.js
else
  exec npm run dev:dc
fi