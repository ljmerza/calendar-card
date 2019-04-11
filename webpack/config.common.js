const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'calendar-card.js',
        path: path.resolve(__dirname, '../')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    /node_modules(?:\/|\\)lit-element|lit-html|moment/
                ],
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};
