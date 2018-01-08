const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge(common, {
    devtool: 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 3000,
        hot: true,
        inline: true,
        stats: 'errors-only',
    },
    module: {
        rules: [
            {
                test: /styles\.less$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        { loader: 'less-loader' },
                    ],
                    fallback: 'style-loader',
                }),
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin({ filename: 'styles.css' }),
    ],
});
