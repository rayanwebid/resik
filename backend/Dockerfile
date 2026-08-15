# Stage 1: Composer build
FROM php:8.3-cli-alpine AS composer_stage
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git curl zip unzip libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev postgresql-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql gd

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

# Copy backend source
COPY . .

# Generate optimized autoload
RUN composer dump-autoload --optimize --no-dev

# Stage 2: Runtime
FROM php:8.3-fpm-alpine AS production

# Install runtime dependencies (Nginx, Supervisor, PHP extension deps)
RUN apk add --no-cache \
    nginx \
    supervisor \
    libzip \
    libpng \
    libjpeg-turbo \
    freetype \
    libpq \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    postgresql-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install zip pdo pdo_mysql pdo_pgsql gd

WORKDIR /var/www/html

# Copy from composer stage
COPY --from=composer_stage /app /var/www/html

# Copy configuration files
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
