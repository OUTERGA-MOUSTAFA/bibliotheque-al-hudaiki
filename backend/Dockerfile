FROM php:8.3-apache

# 1. Installer les extensions PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# 2. 👇 N7ELO MOCHKIL APACHE MPM HNA
RUN a2dismod mpm_event
RUN a2dismod mpm_worker
RUN a2enmod mpm_prefork

# 3. Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. 7et l'projet f l'dossier l'asasi
WORKDIR /var/www/html
COPY . .

# 5. Installer les packages dial Laravel
RUN composer install --no-dev --optimize-autoloader

# 6. Bddel l'configuration dial Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 7. 3ti l'permissions l'Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 8. 👇 SCRIPT DIAL L'BIDAYA (M9ad 100% bla Crash)
RUN echo '#!/bin/bash' > /usr/local/bin/start.sh
RUN echo 'sed -i "s/80/${PORT:-80}/g" /etc/apache2/ports.conf' >> /usr/local/bin/start.sh
RUN echo 'sed -i "s/:80/:${PORT:-80}/g" /etc/apache2/sites-available/000-default.conf' >> /usr/local/bin/start.sh
RUN echo 'php artisan config:clear' >> /usr/local/bin/start.sh
# 👇 N7AYDO l'lien l'9dim 9bel ma n-creyiw wa7ed jdid bach mayt3awedch l'erreur
RUN echo 'rm -f /var/www/html/public/storage' >> /usr/local/bin/start.sh
RUN echo 'php artisan storage:link' >> /usr/local/bin/start.sh
RUN echo 'apache2-foreground' >> /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]