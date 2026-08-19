#!/usr/bin/env bash
set -e

APP_PATH="/var/www/html"

# Ensure database directory exists and sqlite file exists
mkdir -p "$APP_PATH/database"
if [ ! -f "$APP_PATH/database/database.sqlite" ]; then
  touch "$APP_PATH/database/database.sqlite"
  chown www-data:www-data "$APP_PATH/database/database.sqlite" || true
fi

# Ensure storage & cache permissions
chown -R www-data:www-data "$APP_PATH/storage" "$APP_PATH/bootstrap/cache" || true
chmod -R 775 "$APP_PATH/storage" "$APP_PATH/bootstrap/cache" || true

# Install composer deps if vendor missing (optional; can be heavy in startup)
if [ ! -d "$APP_PATH/vendor" ]; then
  composer install --no-dev --optimize-autoloader --no-interaction
fi

# Generate APP_KEY only if not present in env and not in .env (optional fallback)
if [ -z "${APP_KEY:-}" ]; then
  if [ -f "$APP_PATH/.env" ]; then
    if ! grep -q '^APP_KEY=' "$APP_PATH/.env" || grep -q '^APP_KEY=$' "$APP_PATH/.env"; then
      echo "APP_KEY is empty; generating a key (will be written to .env)."
      php "$APP_PATH/artisan" key:generate --force
    fi
  else
    php "$APP_PATH/artisan" key:generate --force
  fi
fi

# Run migrations
php "$APP_PATH/artisan" migrate --force || {
  echo "php artisan migrate failed; check logs"
}

# Execute the container's main process (what's set as CMD in the image)
exec "$@"
