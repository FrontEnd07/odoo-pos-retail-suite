# Odoo POS Retail Suite

Набор независимых дополнений для адаптации Odoo 20 Community POS под сеть
розничных магазинов.

Репозиторий не изменяет ядро Odoo. Все изменения подключаются через штатный
каталог `extra-addons` и устанавливаются как обычные модули.

## Состав

- `pos_retail_suite` — единая точка установки стабильных компонентов.
- `pos_pin_login` — прямой сенсорный вход кассира по PIN.
- `pos_retail_ui` — основа для фирменного упрощённого интерфейса POS.
- `pos_odoo20_compat` — необязательные временные исправления конкретных сборок Odoo 20.

Go-агент моноблока развивается отдельно:
[`FrontEnd07/pos-local-agent`](https://github.com/FrontEnd07/pos-local-agent).

## Быстрая установка

```bash
cd /opt/odoo
git clone https://github.com/FrontEnd07/odoo-pos-retail-suite.git
```

Подключите каталог `addons` в сервис Odoo:

```yaml
services:
  odoo:
    volumes:
      - ./odoo-pos-retail-suite/addons:/mnt/extra-addons
```

Перезапустите Odoo, обновите список приложений и установите приложение
**POS Retail Suite**. Подробная инструкция находится в
[`docs/INSTALL_RU.md`](docs/INSTALL_RU.md).

## Совместимость

- Odoo Community 20.0
- PostgreSQL 16+
- Docker Compose или обычная Linux-установка Odoo

Для production используйте зафиксированный Git-тег, а не произвольное состояние
ветки `main`.

## Лицензия

LGPL-3.0-or-later. См. [LICENSE](LICENSE).

