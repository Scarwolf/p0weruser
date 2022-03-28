const path = require('path');
const WebpackUserscript = require('webpack-userscript');
const webpack = require('webpack');
const { argv } = require('process');
const package = require('./package.json');
const { assert } = require('console');

module.exports = (env, argv) => {
    // Prevent errors during build
    assert(argv.mode === 'development' || argv.mode === 'production', 'You must specificy either development or production mode');
    assert(!!package.version, 'Bad package version is');

    return {
        entry: './src/P0weruser.js',
        output: {
            filename: argv.mode === 'production' ? 'p0weruser.user.js' : 'p0weruser.dev.user.js',
            path: path.resolve(__dirname, 'dist')
        },
        performance: {
            hints: false
        },
        plugins: [
            new WebpackUserscript({
                headers: {
                    name: 'p0weruser - Rel0aded',
                    author: 'PoTTii - Created by Florian Maak',
                    namespace: 'https://github.com/Scarwolf/p0weruser/',
                    license: 'GPL-3.0; http://www.gnu.org/licenses/gpl-3.0.txt',
                    include: '/^https?://pr0gramm.com/.*$/',
                    icon: 'https://pr0gramm.com/media/pr0gramm-favicon.png',
                    connect: ['rep0st.rene8888.at', 'github.com', 'raw.githubusercontent.com', 'pr0gramm.com', 'pr0p0ll.com'],
                    'run-at': 'document-end',
                    grant: ['GM_notification', 'GM_xmlhttpRequest'],
                    require: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js',
                    // The -dev suffix might not be enough to provide a continous dev version. It should work if the script is also 
                    // newer to still receive an update but this is different between script engines. If so, we most likely need to 
                    // append another suffix (Maybe Date or GitHub Run ID).
                    version: package.version + (argv.mode === 'production' ? '' : '-dev'),
                    updateURL: argv.mode === 'production' ? 'https://scarwolf.github.io/p0weruser/p0weruser.user.js' : 'https://scarwolf.github.io/p0weruser/p0weruser.dev.user.js',
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
    }
};
