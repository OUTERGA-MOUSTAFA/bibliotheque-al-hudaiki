#!/bin/sh
set -e

# Les hébergeurs (Railway, Render…) imposent le port via $PORT
PORT="${PORT:-80}"
sed -ri "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# La configuration vient des variables d'environnement de l'hébergeur (pas de .env dans l'image)
php artisan config:cache
php artisan route:cache
php artisan migrate --force

exec apache2-foreground
