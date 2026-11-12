{
    "name": "POS Direct PIN Login",
    "version": "20.0.1.1.0",
    "category": "Sales/Point of Sale",
    "summary": "Direct touch-friendly PIN login for POS employees",
    "author": "FrontEnd07",
    "depends": ["pos_hr"],
    "assets": {
        "point_of_sale._assets_pos": [
            "pos_pin_login/static/src/direct_pin_login.js",
            "pos_pin_login/static/src/direct_pin_login.xml",
            "pos_pin_login/static/src/direct_pin_login.scss",
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

