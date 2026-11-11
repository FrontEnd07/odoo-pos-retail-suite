{
    "name": "POS Odoo 20 Compatibility Fixes",
    "version": "20.0.1.0.0",
    "category": "Technical",
    "summary": "Optional workarounds for known Odoo 20 development-build issues",
    "author": "FrontEnd07",
    "depends": ["web_tour"],
    "assets": {
        "web.assets_backend": [
            "pos_odoo20_compat/static/src/clear_broken_pos_tour.js",
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

