# YoriForum — local Flarum playground (Apache + PHP 8.3).
# Your composer-built code is volume-mounted in; nothing is copied.
FROM php:8.3-apache

# Flarum 2.x PHP requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
      libcurl4-openssl-dev libpng-dev libjpeg-dev libfreetype6-dev \
      libzip-dev libonig-dev unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" curl dom fileinfo gd mbstring opcache pdo_mysql tokenizer zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Serve Flarum's public/ dir (standard layout — no conversion needed locally)
RUN sed -ri 's!/var/www/html!/var/www/flarum/public!g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri 's!<Directory /var/www/>!<Directory /var/www/flarum/>!' /etc/apache2/apache2.conf \
 && printf '<Directory /var/www/flarum/public>\n\tAllowOverride All\n</Directory>\n' \
      > /etc/apache2/conf-available/flarum.conf \
 && a2enconf flarum

WORKDIR /var/www/flarum
