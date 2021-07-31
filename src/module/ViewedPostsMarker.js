import Settings from '../Settings';
import Utils from '../Utils';
import { inflate, deflate } from "pako";

export default class ViewedPostsMarker {
    constructor() {
        this.id = 'ViewedPostsMarker';
        this.name = '"Bereits gesehen"-Markierung';
        this.description = 'Markiert bereits gesehene Medien.';
        this.markOwnFavoritesAsViewed = Settings.get('ViewedPostsMarker.settings.mark_own_favorites_as_viewed');
    }

    load() {
        this.styles = require('../style/viewedPostsMarker.less');
        this.getViewedPosts()
            .then(arr => {
                console.log(arr);
                this.viewedPosts = arr
                this.loadViewedPosts();
            });
    }

    loadViewedPosts() {
        const _this = this;
        // TODO: Fire event only once
        $(document).ajaxComplete(async (event, request, settings) => {
            /* Since this is a global event handler for every ajax we need to specify on which event 
             * it should be fired. This is the case for every event which accesses items.
             */
            if(settings.url.startsWith('/api/items/get')) {
                if(this.markOwnFavoritesAsViewed || !(await this.wouldLoadUserCollection(settings.url))) {
                    if(request.responseJSON.items.length > 0) {
                        const loadedItems = request.responseJSON.items.map(item => item.id);
                        
                        // Intersect loaded and viewed items
                        loadedItems.filter(item => this.viewedPosts.includes(item))
                            .forEach(post => {
                                this.markAsViewed(post);
                            });
                    }
                }
            }
        });

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex, itemData, defaultHeight, jumpToComment) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                _this.addViewedPost(itemData.id);
                _this.markAsViewed(itemData.id);
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();
    }

    /**
     * 
     * @param {number} id 
     */
    markAsViewed(id) {
        const elem = document.getElementById('item-' + id);

        if (elem) {
            elem.classList.add('viewed');
        }
    }

    /**
     * 
     * @returns {Promise<number[]>}
     */
    async getViewedPosts() {
        const posts = Settings.get('viewed_posts');

        if (posts === true) {
            return [];
        }

        const parsed = JSON.parse(posts);

        // If array is loaded, it is the old implementation (using array of post numbers)
        // -> convert it into a Uint8Array
        if(Array.isArray(parsed)) {
            return parsed;
        }
        if(parsed.type === "bitmap") {
            const bitmap = Uint8Array.from(atob(parsed.value), c => c.charCodeAt(0))
            return this.getViewedPostIds(await this.decompressBitmap(bitmap));
        }
    }

    getSettings() {
        return [
            {
                id: 'mark_own_favorites_as_viewed',
                title: 'Eigene Favoriten ebenfalls als gelesen markieren',
                description: 'Markiert Posts in den persönlichen Sammlungen als gelesen'
            }
        ];
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async addViewedPost(id) {
        if (this.viewedPosts.indexOf(id) === -1) {
            this.viewedPosts.push(id);
        }

        // TODO: Don't do that for each ID, maybe a interval?
        const bitmap = await this.arrayToBitmap(this.viewedPosts);
        const compressed = await this.compressBitmap(bitmap);

        const viewedPostObj = {
            type: "bitmap",
            value: btoa(String.fromCharCode(...compressed))
        }

        Settings.set('viewed_posts', JSON.stringify(viewedPostObj));
    }

    /**
     * Retrieves the current logged in username by accessing the API
     * @returns {Promise<string>}
     */
    getLoggedInUserName() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://pr0gramm.com/api/user/name",
                headers: {
                    Accept: "application/json"
                },
                onerror: (/**@type {Response}*/err) => {
                    reject(err);
                },
                onload: (/**@type {Response}*/res) => {
                    let body = JSON.parse(res.response);
                    let name = body.name;
                    if(name) {
                        resolve(name);
                    }
                    reject('Name not found')
                }
            })
        });
    }

    /**
     * Checks any url whether this url would load any of the logged in users collection
     * @param {string} url API Request URL
     * @returns {boolean}
     */
    async wouldLoadUserCollection(url) {
        const name = await this.getLoggedInUserName();
        const queryParams = new URLSearchParams(url);

        // If the current request would retrieve any of the users collection
        return queryParams.has("collection") && queryParams.get("user") === name;
    }

    /**
     * Converts an array of post ids into a bitmap
     * @param {number[]} posts 
     * @returns {Promise<Uint8Array>}
     */
    arrayToBitmap(posts) {
        return new Promise((resolve) => {
            const seenBits = new Uint8Array(10000000 / 8).fill(0);
            posts.forEach(post => {
                const idx = Math.trunc(post / 8)
                if(idx < 0 || idx >= seenBits.length) {
                    return;
                }
                const value = seenBits[idx];
                const update = value | (1 << (7 - post % 8));
                seenBits[idx] = update;
            });
            resolve(seenBits);
        });
    }   

    /**
     * Compress the bitmap using deflate algorithm
     * @param {Uint8Array} bitmap 
     * @returns {Promise<Uint8Array>} 
     */
    compressBitmap(bitmap) {
        return new Promise((resolve, reject) => {
            const compressed = deflate(bitmap, { level: 9 });
            resolve(compressed);
        });
    }

    /**
     * Decrompresses the bitmap using the Inflate Algorithm.
     * @param {Uint8Array} bitmap
     * @returns {Promise<Uint8Array>}
     */
    decompressBitmap(bitmap) {
        return new Promise((resolve, reject) => {
            const decompressed = inflate(bitmap, { level: 9 });
            resolve(decompressed);
        });
    }

    /**
     * Parses the Uint8Array and decode it into post IDs
     * @param {Uint8Array} bytes
     * @returns {Promise<number[]>} 
     */
    getViewedPostIds(bytes) {
        return new Promise((resolve) => {
            let arr = []
            bytes.forEach((byte , index) => {
                arr.push(this.getViewedPostIdsFromByte(byte, index))
            });
            resolve(arr.flat().filter(n => n !== 0));
        });
    }

    /**
     * Decodes a single byte representation into the according post IDs
     * @param {number} byte 
     * @param {number} index
     * @returns {number[]}
     */
    getViewedPostIdsFromByte(byte, index) {   
        let arr = []

        /*
         * Example: 
         *   Byte: 0xB3 (10110011)
         *   Index: 3
         * 
         * | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Index |
         * |---|---|---|---|---|---|---|---|-------|
         * | 1 | 0 | 1 | 1 | 0 | 0 | 1 | 1 |   3   |
         * 
         * Contains the follwing post IDs:
         *   - 16 (seen)
         *   - 17 
         *   - 18 (seen)
         *   - 19 (seen)
         *   - 20
         *   - 21
         *   - 22 (seen)
         *   - 23 (seen)
         */
        for(let i = 0; i < 8; i++) {
            if((byte & (1 << i)) !== 0) {
                arr.push((7 - i) + 8 * index)
            }
        }

        return arr;
    }
}
