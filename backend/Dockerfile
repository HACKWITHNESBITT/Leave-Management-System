FROM serversideup/php:8.3-fpm-nginx

# Switch to root to set permissions
USER root

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install Composer dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# Fix permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# copy entrypoint and give execute permissions
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch back to web user
USER www-data

# Use the entrypoint to prepare the app (create sqlite file, run migrations)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Default command to run php-fpm (the entrypoint will exec this)
CMD ["php-fpm"]
