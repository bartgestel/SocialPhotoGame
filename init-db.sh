#!/bin/bash
set -e

echo "Checking if database 'socialphotogame' exists..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    SELECT 'CREATE DATABASE socialphotogame'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialphotogame')\gexec
EOSQL

echo "Database 'socialphotogame' is ready!"
