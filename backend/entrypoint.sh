#!/bin/sh

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Running server"
npm run start:dev