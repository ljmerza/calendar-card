module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "debug": true,
                "targets": {
                    "android": "4.4.3",
                    "chrome": "50",
                    "edge": "17",
                    "firefox": "64",
                    "ie": "10",
                    "ios": "8",
                    "opera": "57",
                    "safari": "11.1",
                    "samsung": "4"
                },
                "shippedProposals": true
            }
        ]
    ]
}