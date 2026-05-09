FROM richarvey/nginx-php-fpm:latest

# Set environment variables for this specific image
ENV WEB_DOCUMENT_ROOT=/var/www/html/public
ENV APP_ENV=production
ENV RUN_SCRIPTS=1

# Copy Laravel application
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Fix permissions for storage and bootstrap directories
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80
