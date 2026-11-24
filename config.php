<?php
// Keep this file private (see .htaccess). Never commit real credentials.
return [
    'smtp_host'   => 'smtp.gmail.com',
    'smtp_port'   => 587,                       // STARTTLS
    'smtp_user'   => 'sibayanhayden7@gmail.com',   // the Gmail that sends AND receives
    'smtp_pass'   => 'qfvp iyga itkc dabn',     // Gmail "App Password" (needs 2-Step Verification)
    'to_email'    => 'sibayanhayden7@gmail.com',   // where messages arrive
    'site_name'   => 'Hayden Sibayan | Portfolio',
    'min_seconds' => 3,                         // reject forms submitted faster than this (bots)
    'max_per_hour'=> 5,                         // per visitor IP
];
