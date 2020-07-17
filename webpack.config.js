const path = require('path');
const WebpackUserscript = require('webpack-userscript');
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
        new WebpackUserscript({
            headers: {
                name: 'p0weruser - Rel0aded',
                author: 'Florian Maak - Modified by PoTTii',
                namespace: 'https://github.com/Scarwolf/p0weruser/',
                license: 'GPL-3.0; http://www.gnu.org/licenses/gpl-3.0.txt',
                include: '/^https?://pr0gramm.com/.*$/',
                icon: 'https://pr0gramm.com/media/pr0gramm-favicon.png',
                connect: ['rep0st.rene8888.at', 'github.com', 'raw.githubusercontent.com', 'pr0gramm.com', 'pr0p0ll.com'],
                'run-at': 'document-end',
                grant: ['GM_notification', 'GM_xmlhttpRequest'],
                require: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js',
                updateURL: 'https://scarwolf.github.io/p0weruser/p0weruser.user.js'
            },
            metajs: false
        }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de/)
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
