{
    "name": "POS Retail UI",
    "version": "20.0.1.0.0",
    "category": "Sales/Point of Sale",
    "summary": "Stable extension point for the custom retail POS interface",
    "author": "FrontEnd07",
    "depends": ["point_of_sale"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_retail_ui/static/lib/simple-keyboard/simple-keyboard.js",
            "pos_retail_ui/static/lib/simple-keyboard/simple-keyboard.css",
            "pos_retail_ui/static/src/product_search_keyboard.js",
            "pos_retail_ui/static/src/product_search_keyboard.xml",
            "pos_retail_ui/static/src/retail_ui.scss",
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

