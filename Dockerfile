FROM richarvey/nginx-php-fpm:latest

# Copy backend code into the container
COPY . /var/www/html

# Set Laravel's public directory as the web root
ENV WEBROOT /var/www/html/public
ENV APP_ENV production

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

CMD ["/start.sh"]
