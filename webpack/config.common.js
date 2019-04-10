const path = require('path');


module.exports = {
    entry: ["./src/index.js"],
    output: {
        filename: 'calendar-card.js',
        path: path.resolve(__dirname, '../'),
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                include: [
                    /node_modules(?:\/|\\)lit-element|lit-html|moment|@babel\/polyfill/
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ["@babel/preset-env", {
                                "modules": "commonjs",
                                "targets": "> 0.25%, not dead",
                            }],
                            
                        ],
                        "comments": false,
                        plugins: [
                            ["@babel/plugin-proposal-object-rest-spread"],
                            ["@babel/plugin-transform-spread"],
                            ["iife-wrap"],
                            ["@babel/plugin-transform-template-literals"],
                            ["@babel/plugin-proposal-decorators", {
                                "legacy": true
                            }],
                            ["@babel/plugin-proposal-class-properties", {
                                "loose": true
                            }],
                        ],
                    },
                },
            },
        ],
    },
};
