#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
fi

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Run seeders
echo "Running seeders..."
php artisan db:seed --force

# Optimize Laravel config and routes
echo "Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Link storage
echo "Linking storage..."
php artisan storage:link --force || true

echo "Starting services..."
exec "$@"
