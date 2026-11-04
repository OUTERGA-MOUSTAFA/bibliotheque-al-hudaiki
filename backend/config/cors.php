<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // '*' est interdit par les navigateurs quand supports_credentials = true.
    // FRONTEND_URL peut contenir plusieurs origines séparées par des virgules
    // (ex. http://localhost:3000,https://al-hudaiki.vercel.app)
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:3000')))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
