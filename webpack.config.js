const path = require('path');
const fs = require('fs');
const WebpackAutoInject = require('webpack-auto-inject-version');
const webpack = require('webpack');

module.exports = {
    entry: './src/P0weruser.js',
    output: {
        filename: 'p0weruser.user.js',
        path: path.resolve(__dirname, 'dist')
    },
    performance: {
        hints: false
    },
    plugins: [
        new WebpackAutoInject({
            NAME: 'p0weruser',
            SHORT: 'pr0',
            SILENT: true,
            PACKAGE_JSON_PATH: './package.json',
            components: {
                AutoIncreaseVersion: true,
                InjectByTag: true
            },
            componentsOptions: {
                InjectAsComment: {
                    tag: fs.readFileSync(
                        path.resolve(__dirname, 'src/template/scriptHeader.txt'), 'utf8'
                    ),
                    dateFormat: 'dddd, mmmm dS, yyyy, h:MM:ss TT'
                },
                AutoIncreaseVersion: {
                    runInWatchMode: false
                },
                InjectByTag: {
                    fileRegex: /\.+/,
                    dateFormat: 'h:MM:ss TT'
                }
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true,
                        removeComments: true,
                        collapseWhitespace: true
                    }
                }]
            },
            {
                test: /\.(less|css)$/,
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'less-loader'
                }]
            }
        ]
    }
};
