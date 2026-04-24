FROM richarvey/nginx-php-fpm:latest
COPY . /var/www/html
ENV WEBROOT /var/www/html/public
RUN composer install --no-dev
# Only include the line below if you have a package.json for React
RUN npm install && npm run build
