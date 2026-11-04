#!/bin/sh
set -e

# Railway impose le port via $PORT. On remplace la ligne entière (et pas « 80 » partout) :
# relancé deux fois, le script ne transforme pas 8080 en 808080.
PORT="${PORT:-80}"
sed -ri "s/^Listen [0-9]+$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# La configuration vient des variables Railway (pas de .env dans l'image)
php artisan config:cache
php artisan route:cache

# Lien public/storage (recréé à chaque démarrage)
rm -f public/storage
php artisan storage:link

# Met la base Neon à jour. En cas d'échec (base injoignable…), on le signale dans les logs
# sans bloquer le démarrage : le site reste accessible et l'erreur est visible.
php artisan migrate --force || echo "⚠️  php artisan migrate a échoué : vérifiez DB_* dans les variables Railway"

exec apache2-foreground
