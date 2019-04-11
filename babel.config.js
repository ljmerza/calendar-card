module.exports = {
    "presets": [
        [
            "@babel/preset-env",
            // {
            //     "modules": false,
            //     "targets": {
            //         "esmodules": false
            //     }
            // }
        ],
        // [
        //     "minify"
        // ]
    ],
    "comments": false,
    "plugins": [
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
        [
            "@babel/plugin-proposal-class-properties",
            {
                "loose": true
            }
        ],
        [
            "@babel/plugin-transform-template-literals"
        ],
        [
            "iife-wrap"
        ],
    ]
}