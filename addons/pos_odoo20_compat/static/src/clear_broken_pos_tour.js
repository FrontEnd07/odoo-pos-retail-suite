/** @odoo-module **/

// Workaround for a broken interactive POS onboarding tour in selected Odoo 20
// development images. This module is optional and is not installed by the
// POS Retail Suite meta module.
if (localStorage.getItem("current_tour") === "point_of_sale_tour") {
    localStorage.removeItem("current_tour");
    localStorage.removeItem("current_tour.config");
    localStorage.removeItem("current_tour.index");
    localStorage.removeItem("current_tour.on_error");
}

