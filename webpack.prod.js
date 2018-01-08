const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge(common, {
    devtool: false,
    module: {
        rules: [
            {
                test: /styles\.less$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true,
                            },
                        },
                        { loader: 'postcss-loader' },
                        { loader: 'less-loader' },
                    ],
                    fallback: 'style-loader',
                }),
            },
        ],
    },
    plugins: [
        new UglifyJSPlugin(),
        new ExtractTextPlugin({ filename: 'styles.css' }),
    ],
});
