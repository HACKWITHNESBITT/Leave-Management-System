FROM richarvey/nginx-php-fpm:latest

# Set environment variables for Laravel
ENV WEBROOT /var/www/html/public
ENV APP_ENV production
ENV COMPOSER_ALLOW_SUPERUSER 1

# Update system and install PHP 8.3 dependencies
RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    git \
    unzip \
    && add-apt-repository -y ppa:ondrej/php \
    && apt-get update \
    && apt-get install -y \
    php8.3 \
    php8.3-cli \
    php8.3-fpm \
    php8.3-mbstring \
    php8.3-xml \
    php8.3-curl \
    php8.3-zip \
    php8.3-pdo \
    php8.3-mysql \
    php8.3-bcmath \
    && update-alternatives --set php /usr/bin/php8.3 \
    && rm -rf /var/lib/apt/lists/*

# Copy Laravel application
COPY . /var/www/html

# Set working directory
WORKDIR /var/www/html

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Fix permissions for storage and bootstrap directories
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html
RUN chmod -R 775 /var/www/html/storage
RUN chmod -R 775 /var/www/html/bootstrap/cache

# Clear and cache Laravel configuration
RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true

EXPOSE 80
