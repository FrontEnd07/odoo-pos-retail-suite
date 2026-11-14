/** @odoo-module **/

import { Component, onMounted, onWillUnmount, proxy, useProps, t } from "@odoo/owl";
import { patch } from "@web/core/utils/patch";
import { Dialog } from "@web/core/dialog/dialog";
import { usePos } from "@point_of_sale/app/hooks/pos_hook";
import { Navbar } from "@point_of_sale/app/components/navbar/navbar";

const SEARCH_LAYOUTS = {
    ru: {
        default: [
            "1 2 3 4 5 6 7 8 9 0 {bksp}",
            "й ц у к е н г ш щ з х ъ",
            "ф ы в а п р о л д ж э",
            "я ч с м и т ь б ю",
            "{lang} {space} {clear} {done}",
        ],
    },
    en: {
        default: [
            "1 2 3 4 5 6 7 8 9 0 {bksp}",
            "q w e r t y u i o p",
            "a s d f g h j k l",
            "z x c v b n m",
            "{lang} {space} {clear} {done}",
        ],
    },
};

export class ProductSearchKeyboard extends Component {
    static template = "pos_retail_ui.ProductSearchKeyboard";
    static components = { Dialog };
    props = useProps({ close: t.function() });

    setup() {
        this.pos = usePos();
        this.keyboard = null;
        this.state = proxy({ value: this.pos.searchProductWord || "", layout: "ru" });
        onMounted(() => this.mountKeyboard());
        onWillUnmount(() => this.keyboard?.destroy());
    }

    mountKeyboard() {
        const Keyboard = globalThis.SimpleKeyboard?.default || globalThis.SimpleKeyboard;
        if (!Keyboard) {
            throw new Error("simple-keyboard library is not loaded");
        }
        this.keyboard = new Keyboard(".retail-simple-keyboard", {
            layout: SEARCH_LAYOUTS[this.state.layout],
            layoutName: "default",
            theme: "hg-theme-default retail-hg-theme",
            useButtonTag: true,
            preventMouseDownDefault: true,
            disableCaretPositioning: true,
            mergeDisplay: true,
            display: this.getDisplayLabels(),
            buttonTheme: [
                { class: "retail-hg-language", buttons: "{lang}" },
                { class: "retail-hg-space", buttons: "{space}" },
                { class: "retail-hg-clear", buttons: "{clear}" },
                { class: "retail-hg-done", buttons: "{done}" },
                { class: "retail-hg-backspace", buttons: "{bksp}" },
            ],
            onChange: (value) => this.updateSearch(value),
            onKeyPress: (button) => this.onKeyPress(button),
        });
        this.keyboard.setInput(this.state.value);
    }

    getDisplayLabels() {
        return {
            "{bksp}": "⌫",
            "{lang}": this.state.layout === "ru" ? "RU" : "EN",
            "{space}": "Пробел",
            "{clear}": "Очистить",
            "{done}": "Готово",
        };
    }

    updateSearch(value) {
        this.state.value = value;
        this.pos.searchProductWord = value;
    }

    onKeyPress(button) {
        if (button === "{lang}") {
            this.state.layout = this.state.layout === "ru" ? "en" : "ru";
            this.keyboard.setOptions({
                layout: SEARCH_LAYOUTS[this.state.layout],
                display: this.getDisplayLabels(),
            });
        } else if (button === "{clear}") {
            this.keyboard.clearInput();
            this.updateSearch("");
        } else if (button === "{done}") {
            this.props.close();
        }
    }

    clear() {
        this.keyboard?.clearInput();
        this.updateSearch("");
    }
}

patch(Navbar.prototype, {
    openProductSearchKeyboard() {
        this.dialog.add(ProductSearchKeyboard);
    },
});
