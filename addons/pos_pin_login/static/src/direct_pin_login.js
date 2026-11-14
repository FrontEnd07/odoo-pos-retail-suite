/** @odoo-module **/

import { onMounted, onWillUnmount } from "@odoo/owl";
import { patch } from "@web/core/utils/patch";
import { LoginScreen } from "@point_of_sale/app/screens/login_screen/login_screen";
import { PosStore } from "@point_of_sale/app/services/pos_store";
import { BarcodeReader } from "@point_of_sale/app/services/barcode_reader_service";

patch(BarcodeReader.prototype, {
    scan(code) {
        if (code) {
            this.retailLastScanAt = Date.now();
            window.dispatchEvent(new CustomEvent("retail-barcode-scanned"));
        }
        return super.scan(...arguments);
    },
});

// A browser session authenticated as an Odoo administrator must never make
// that administrator the active cashier.  Odoo's pos_hr restores the last
// connected employee from IndexedDB during startup, which can otherwise skip
// the PIN screen after a restart.  Treat every POS startup as a locked
// register and require an employee PIN before sales are available.
patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        if (this.config.module_pos_hr) {
            this.resetCashier();
            this.accessRight.hasLoggedIn.set(false);
            this.login = true;
            // Router startup can restore the URL that was open before a
            // browser restart.  Navigate after that startup turn so the lock
            // screen always wins over a stale /product URL.
            setTimeout(() => this.navigate("LoginScreen"), 0);
        }
    },

    checkPreviousLoggedCashier() {
        if (!this.config.module_pos_hr) {
            return super.checkPreviousLoggedCashier(...arguments);
        }
        this.resetCashier();
        this.accessRight.hasLoggedIn.set(false);
        this.login = true;
    },
});

patch(LoginScreen.prototype, {
    setup() {
        super.setup(...arguments);
        this.state.showPin = false;
        this.state.serverOnline = true;
        this.state.scannerSeen = false;
        this.retailServerCheckTimer = null;
        this.retailScannerActivityHandler = () => {
            this.state.scannerSeen = true;
        };
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
            window.addEventListener(
                "retail-barcode-scanned",
                this.retailScannerActivityHandler
            );
        });
        onWillUnmount(() => {
            clearInterval(this.retailServerCheckTimer);
            window.removeEventListener(
                "retail-barcode-scanned",
                this.retailScannerActivityHandler
            );
        });
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

    get retailScannerStatus() {
        // Keyboard-wedge USB scanners expose no physical connection state to
        // the browser.  Only report success after a real barcode event has
        // reached Odoo in the current login-screen session.
        const ready = this.state.scannerSeen;
        return {
            ready,
            label: ready ? "Сканер отвечает" : "Сканер не проверен",
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

