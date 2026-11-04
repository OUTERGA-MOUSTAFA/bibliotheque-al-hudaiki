FROM php:8.3-apache

# 1. Installer les extensions PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# 2. Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. 7et l'projet f l'dossier l'asasi
WORKDIR /var/www/html
COPY . .

# 4. Installer les packages dial Laravel
RUN composer install --no-dev --optimize-autoloader

# 5. Bddel l'configuration dial Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 6. 3ti l'permissions l'Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 7. 👇 SCRIPT DIAL L'BIDAYA (M9ad w Bla mochakil dial syntax)
RUN echo '#!/bin/bash' > /usr/local/bin/start.sh
RUN echo 'sed -i "s/80/${PORT:-80}/g" /etc/apache2/ports.conf' >> /usr/local/bin/start.sh
RUN echo 'sed -i "s/:80/:${PORT:-80}/g" /etc/apache2/sites-available/000-default.conf' >> /usr/local/bin/start.sh
RUN echo 'php artisan config:clear' >> /usr/local/bin/start.sh
RUN echo 'php artisan storage:link' >> /usr/local/bin/start.sh
RUN echo 'apache2-foreground' >> /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]