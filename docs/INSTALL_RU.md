# Установка на чистый Odoo 20

## 1. Получение исходного кода

```bash
cd /opt/odoo
git clone https://github.com/FrontEnd07/odoo-pos-retail-suite.git
```

Для production зафиксируйте проверенную версию:

```bash
cd /opt/odoo/odoo-pos-retail-suite
git checkout v1.0.0
```

## 2. Подключение к Docker Compose

Добавьте в сервис `odoo`:

```yaml
volumes:
  - ./odoo-pos-retail-suite/addons:/mnt/extra-addons
```

Если `/mnt/extra-addons` уже используется, добавьте путь репозитория в
`addons_path` или объедините пользовательские модули в одном каталоге.

## 3. Установка из интерфейса

1. Перезапустите контейнер Odoo.
2. Включите режим разработчика.
3. Откройте **Приложения → Обновить список приложений**.
4. Найдите **POS Retail Suite**.
5. Нажмите **Установить**.

Модули `pos_pin_login` и `pos_retail_ui` установятся автоматически.
`pos_odoo20_compat` устанавливайте только при наличии описанной ошибки тура.

## 4. Установка командой

Из каталога, содержащего production `compose.yaml`:

```bash
/opt/odoo/odoo-pos-retail-suite/deploy/install.sh odoo_production
```

Перед выполнением убедитесь, что имя сервиса Odoo — `odoo`, а каталог addons
уже подключён в контейнер.

## 5. Проверка

- Откройте POS и убедитесь, что отображается PIN-клавиатура.
- Проверьте вход кассира и менеджера.
- Проведите тестовую продажу и возврат.
- Проверьте повторный запуск браузера и контейнера Odoo.

