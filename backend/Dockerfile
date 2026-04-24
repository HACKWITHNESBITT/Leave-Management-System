# Dockerfile

FROM richarvey/nginx-php-fpm

# Set the working directory
WORKDIR /var/www/html

# Copy the current directory contents into the container at /var/www/html
COPY . .

# Install Composer dependencies
RUN composer install

# Set permissions for storage and bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache

# Set the web root
ENV WEBROOT /var/www/html/public

# Expose port 80
EXPOSE 80

# Start PHP-FPM and Nginx
CMD php-fpm & nginx -g 'daemon off;'
