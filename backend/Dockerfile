FROM php:8.3-apache

# 1. Installer les extensions PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# 2. Apache : un seul MPM (prefork, requis par mod_php) + mod_rewrite (routes Laravel)
#    On supprime TOUS les MPM activés puis on ne remet que prefork.
#    « apache2ctl -t » fait échouer le build tout de suite s'il reste un conflit,
#    au lieu de le découvrir au démarrage sur Railway.
RUN rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf \
    && ln -s /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -s /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && a2enmod rewrite \
    && echo "ServerName localhost" > /etc/apache2/conf-available/servername.conf \
    && a2enconf servername \
    && printf 'ServerTokens Prod\nServerSignature Off\nTraceEnable Off\n<Directory /var/www/html/public>\n    Options -Indexes\n</Directory>\n' > /etc/apache2/conf-available/securite.conf \
    && a2enconf securite \
    && ls /etc/apache2/mods-enabled | grep mpm \
    && apache2ctl -t

# 3. Sécurité de PHP en production : ne pas annoncer sa version, ne jamais afficher les erreurs aux visiteurs,
#    taille des envois limitée (les images font 5 Mo au plus), cookies de session protégés
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && printf 'expose_php = Off\ndisplay_errors = Off\nlog_errors = On\nupload_max_filesize = 6M\npost_max_size = 8M\nsession.cookie_httponly = 1\nsession.cookie_secure = 1\nsession.use_strict_mode = 1\n' > "$PHP_INI_DIR/conf.d/zz-securite.ini"

# 4. Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Téléchargements plus sûrs depuis le réseau du builder Railway :
#  - moins de téléchargements en parallèle (les 105 en même temps expiraient, puis PHP plantait : erreur 139)
#  - délais plus longs, et Composer exécuté en root sans avertissement
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_MAX_PARALLEL_HTTP=4 \
    COMPOSER_PROCESS_TIMEOUT=900 \
    COMPOSER_NO_INTERACTION=1

WORKDIR /var/www/html

# 5. Dépendances d'abord, SEULES : cette couche reste en cache tant que composer.lock ne change pas.
#    Avant, « COPY . . » venait avant : chaque modification du code retéléchargeait les 105 paquets.
#    3 tentatives si GitHub ne répond pas (timeouts, 504).
COPY composer.json composer.lock ./
RUN for essai in 1 2 3; do \
        composer install --no-dev --no-scripts --no-autoloader --prefer-dist && break; \
        echo "composer install : échec de la tentative $essai, nouvel essai dans 20 s"; \
        [ "$essai" = 3 ] && exit 1; \
        sleep 20; \
    done

# 6. Code de l'application, puis autoloader optimisé (+ package:discover)
COPY . .
RUN composer dump-autoload --optimize --no-dev

# 7. Bddel l'configuration dial Apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 8. 3ti l'permissions l'Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. SCRIPT DIAL L'BIDAYA
RUN echo '#!/bin/bash' > /usr/local/bin/start.sh
# Rôle du conteneur (variable Railway ROLE) :
#  - absent / « web » : site + API (Apache), lance aussi les migrations
#  - « scheduler »     : tâches planifiées (rappels de retard, nettoyage des tokens), sans Apache
#  - « worker »        : file d'attente (e-mails en arrière-plan), si QUEUE_CONNECTION=database
RUN echo 'php artisan config:clear >/dev/null' >> /usr/local/bin/start.sh
RUN echo 'if [ "$ROLE" = "scheduler" ]; then echo "Rôle : scheduler"; exec php artisan schedule:work; fi' >> /usr/local/bin/start.sh
RUN echo 'if [ "$ROLE" = "worker" ]; then echo "Rôle : worker"; exec php artisan queue:work --sleep=3 --tries=3 --max-time=3600; fi' >> /usr/local/bin/start.sh
# Même nettoyage au démarrage : garantit un seul MPM quoi qu'il arrive à l'image, et l'affiche dans les logs
RUN echo 'rm -f /etc/apache2/mods-enabled/mpm_*.load /etc/apache2/mods-enabled/mpm_*.conf' >> /usr/local/bin/start.sh
RUN echo 'ln -s /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load' >> /usr/local/bin/start.sh
RUN echo 'ln -s /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf' >> /usr/local/bin/start.sh
RUN echo 'echo "MPM actifs : $(ls /etc/apache2/mods-enabled | grep mpm | tr "\n" " ")"' >> /usr/local/bin/start.sh
RUN echo 'grep -rn "LoadModule mpm_" /etc/apache2/apache2.conf /etc/apache2/conf-enabled /etc/apache2/sites-enabled 2>/dev/null || true' >> /usr/local/bin/start.sh
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