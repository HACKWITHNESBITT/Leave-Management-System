FROM php:8.3-fpm

# System dependencies
RUN apt-get update &amp;&amp; apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    nginx \
    supervisor \
    &amp;&amp; apt-get clean \
    &amp;&amp; rm -rf /var/lib/apt/lists/*

# PHP Extensions for Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip exif

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY backend/ .

# Composer install
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    &amp;&amp; chmod -R 775 storage bootstrap/cache

# Configs
COPY nginx.conf /etc/nginx/sites-available/default
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord"]
