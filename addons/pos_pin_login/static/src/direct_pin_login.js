/** @odoo-module **/

import { onMounted, onWillUnmount } from "@odoo/owl";
import { patch } from "@web/core/utils/patch";
import { LoginScreen } from "@point_of_sale/app/screens/login_screen/login_screen";

patch(LoginScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.state.showPin = false;
        this.state.serverOnline = true;
        this.retailServerCheckTimer = null;
        onMounted(() => {
            if (this.pos.config.module_pos_hr) {
                this.pos.resetCashier();
                this.pos.login = true;
            }
            this.checkRetailServerStatus();
            this.retailServerCheckTimer = setInterval(
                () => this.checkRetailServerStatus(),
                5000
            );
        });
        onWillUnmount(() => clearInterval(this.retailServerCheckTimer));
    },

    async checkRetailServerStatus() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        try {
            const response = await fetch(`/web/static/img/favicon.ico?pos_check=${Date.now()}`, {
                cache: "no-store",
                signal: controller.signal,
            });
            this.state.serverOnline = response.ok;
        } catch {
            this.state.serverOnline = false;
        } finally {
            clearTimeout(timeout);
        }
    },

    appendPinDigit(digit) {
        this.state.pin = `${this.state.pin || ""}${digit}`;
        this.updatePinDisplay();
    },

    removePinDigit() {
        this.state.pin = (this.state.pin || "").slice(0, -1);
        this.updatePinDisplay();
    },

    updatePinDisplay() {
        const input = this.autofocusRef?.el;
        if (input) {
            input.value = this.state.showPin
                ? this.state.pin || ""
                : "•".repeat((this.state.pin || "").length);
        }
    },

    togglePinVisibility() {
        this.state.showPin = !this.state.showPin;
        this.updatePinDisplay();
    },

    get retailRegisterNumber() {
        return this.pos.config.id;
    },

    get retailNetworkStatus() {
        const connected =
            this.state.serverOnline && navigator.onLine && !this.pos.data?.network?.offline;
        return {
            connected,
            label: connected ? "Сервер доступен" : "Нет связи с сервером",
        };
    },

    get retailSyncStatus() {
        const pending = Object.values(this.pos.pendingOrder || {}).reduce(
            (total, orders) => total + (orders?.size || 0),
            0
        );
        const syncing = this.pos.syncingOrders?.size || 0;
        const count = pending + syncing;
        const connected = this.retailNetworkStatus.connected;
        return {
            ready: connected && count === 0,
            count,
            label: !connected
                ? "Синхронизация ожидает подключения"
                : count
                  ? `Ожидают синхронизации: ${count}`
                  : "Данные синхронизированы",
        };
    },

    get retailPrinterStatus() {
        const configuredPrinters = [
            ...(this.pos.config.receipt_printer_ids || []),
            ...(this.pos.config.preparation_printer_ids || []),
        ];
        const connected = configuredPrinters.some((printer) => Boolean(printer?._instance));
        const configured = configuredPrinters.length > 0;
        return {
            configured,
            connected,
            label: connected
                ? "Принтер подключён"
                : configured
                  ? "Принтер настроен, но недоступен"
                  : "Принтер не настроен",
        };
    },

    get retailCashStatus() {
        if (!this.retailNetworkStatus.connected) {
            return { level: "error", label: "Нет связи с сервером" };
        }
        if (!this.retailSyncStatus.ready) {
            return { level: "warning", label: "Ожидается синхронизация" };
        }
        if (this.retailPrinterStatus.configured && !this.retailPrinterStatus.connected) {
            return { level: "warning", label: "Проверьте принтер" };
        }
        return { level: "ready", label: "Касса готова" };
    },

    async submitPin() {
        if (!this.state.pin) {
            return;
        }
        const employee = await this.pos.selectCashier(this.state.pin, true);
        if (!employee) {
            this.state.pin = "";
            this.updatePinDisplay();
        }
    },
});

