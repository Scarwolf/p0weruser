import path from "path";
import { defineConfig } from "vite";
import monkeyPlugin from "vite-plugin-monkey";
import * as pkg from "./package.json";

export default defineConfig(({ mode }) => ({
    plugins: [
        monkeyPlugin({
            entry: 'src/P0weruser.ts',
            userscript: {
                name: 'p0weruser - Rel0aded' + (mode === 'production' ? '' : ' [Dev]'),
                author: 'PoTTii - Created by Florian Maak',
                namespace: 'https://github.com/Scarwolf/p0weruser/',
                    license: 'GPL-3.0; http://www.gnu.org/licenses/gpl-3.0.txt',
                    include: '/^https?://pr0gramm.com/.*$/',
                    icon: 'https://pr0gramm.com/media/pr0gramm-favicon.png',
                    connect: ['rep0st.rene8888.at', 'github.com', 'raw.githubusercontent.com', 'pr0gramm.com', 'pr0p0ll.com'],
                    'run-at': 'document-end',
                    grant: ['GM_notification', 'GM_xmlhttpRequest'],
                    require: [ 'https://code.jquery.com/ui/1.13.1/jquery-ui.min.js' ],
                    resource: {
                        'customCSS': 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css'
                    },
                    // The -dev suffix might not be enough to provide a continous dev version. It should work if the script is also 
                    // newer to still receive an update but this is different between script engines. If so, we most likely need to 
                    // append another suffix (Maybe Date or GitHub Run ID).
                    version: pkg.version + (mode === 'production' ? '' : '-dev'),
                    updateURL: mode === 'production' ? 'https://scarwolf.github.io/p0weruser/p0weruser.user.js' : 'https://scarwolf.github.io/p0weruser/p0weruser.dev.user.js',
                    downloadURL: mode === 'production' ? 'https://scarwolf.github.io/p0weruser/p0weruser.user.js' : 'https://scarwolf.github.io/p0weruser/p0weruser.dev.user.js',
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    assetsInclude: ['assets/**']
}));