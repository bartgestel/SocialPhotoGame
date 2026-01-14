#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE socialphotogame'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'socialphotogame')\gexec
EOSQL

echo "Database 'socialphotogame' is ready!"
