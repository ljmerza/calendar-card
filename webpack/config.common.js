const path = require('path');

module.exports = {
    entry: './src/index.js',
    devtool: 'source-map',
    output: {
        filename: 'calendar-card.js',
        path: path.resolve(__dirname, '../dist')
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                include: [
                    /node_modules(?:\/|\\)lit-element|lit-html/
                ],
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
};
