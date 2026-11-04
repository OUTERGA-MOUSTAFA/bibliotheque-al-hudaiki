FROM php:8.3-apache

# 1. Installer les extensions PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# 2. 👇 L'7AL L'2AKID DIAL APACHE MPM (N7AYDO L'FICHIERS B L'YED)
RUN rm -f /etc/apache2/mods-enabled/mpm_event.*
RUN rm -f /etc/apache2/mods-enabled/mpm_worker.*
# -sf : l'image active déjà mpm_prefork, un simple « ln -s » échouerait (File exists)
RUN ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
RUN ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

# 3. Activer mod_rewrite (Mohim l Laravel)
RUN a2enmod rewrite

# 4. Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. 7et l'projet f l'dossier l'asasi
WORKDIR /var/www/html
COPY . .

# 6. Installer les packages dial Laravel
RUN composer install --no-dev --optimize-autoloader

# 7. Bddel l'configuration dial Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 8. 3ti l'permissions l'Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. SCRIPT DIAL L'BIDAYA
RUN echo '#!/bin/bash' > /usr/local/bin/start.sh
# On remplace la ligne entière (et pas « 80 » partout) : relancé, le script ne change pas 8080 en 808080
RUN echo 'sed -ri "s/^Listen [0-9]+$/Listen ${PORT:-80}/" /etc/apache2/ports.conf' >> /usr/local/bin/start.sh
RUN echo 'sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT:-80}>/" /etc/apache2/sites-available/000-default.conf' >> /usr/local/bin/start.sh
RUN echo 'php artisan config:clear' >> /usr/local/bin/start.sh
RUN echo 'rm -f /var/www/html/public/storage' >> /usr/local/bin/start.sh
RUN echo 'php artisan storage:link' >> /usr/local/bin/start.sh
# Met la base Neon à jour (colonnes « lu », avis…). En cas d'échec, message dans les logs sans bloquer le site
RUN echo 'php artisan migrate --force || echo "migrate a échoué : vérifiez les variables DB_* dans Railway"' >> /usr/local/bin/start.sh
RUN echo 'exec apache2-foreground' >> /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]