FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    wget \
    icu-dev \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install Laravel dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# Setup Nginx and Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy a basic start script to run both Nginx and PHP
RUN echo "#!/bin/sh\nphp-fpm -D\nnginx -g 'daemon off;'" > /start.sh
RUN chmod +x /start.sh

# Basic Nginx Config (Inline)
RUN echo "server { \
    listen 80; \
    root /var/www/html/public; \
    index index.php; \
    location / { try_files \$uri \$uri/ /index.php?\$query_string; } \
    location ~ \.php$ { \
        include fastcgi_params; \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name; \
    } \
}" > /etc/nginx/http.d/default.conf

EXPOSE 80

CMD ["/start.sh"]
