#!/usr/bin/env sh
set -eu

DB_NAME="${1:-}"
if [ -z "$DB_NAME" ]; then
    echo "Usage: $0 <database>" >&2
    exit 2
fi

docker compose stop odoo
docker compose run --rm --no-deps odoo \
    -d "$DB_NAME" -i pos_retail_suite --stop-after-init
docker compose up -d odoo

echo "POS Retail Suite installed in database: $DB_NAME"

