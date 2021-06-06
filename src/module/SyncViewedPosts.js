import { v3 as uuidv3 } from "uuid";
import Settings from "../Settings";
import { inflate, deflate } from "pako";

/**
 * Synchronizes viewed posts with pr0 app
 */
export class AppSyncViewedPosts {
    constructor() {
        this.id = "AppSyncViewedPosts";
        this.name = `"Bereits gesehen" aus der App übernehmen und synchronisieren <b style="color: #ee4d2e">(experimentell)</b>`;
        this.description = "Bereits gesehene Beiträge werden aus der pr0gramm App übernommen und gesehene Beiträge vom Browser synchronisiert. Die Synchronisation erfolgt in Intervallen, es kann also dauern bis gesehene Beiträge sichtbar werden.";
        /** @type {Uint8Array} */this.seenBits = new Uint8Array();
    }

    load() {

        //Token
        this.token = this.getIdentifier()
            .then(identifier => this.buildToken(identifier));

        //Load seen posts from app
        this.token
            .then(token => this.getSeenBits(token))
            .then(response => this.decodeSeenBits(response.value))
            .then(bytes => this.getViewedPostIds(bytes))
            .then(ids => this.mergeIntoSettings(ids))
            .catch(err => console.error(err));

        //Synchronize now...
        this.saveSeenBits();

        //... and every hour
        setInterval(() => {
            this.saveSeenBits();
        }, 3600000);

        //TODO is it possible?
        /*window.addEventListener("beforeunload", async (event) => {
            event.preventDefault();
            await this.saveSeenBits()
                .finally(() => delete event['returnValue']);
        })*/
    }

    /**
     * Synchronize the viewed posts with app 
     * @returns {Promise}
     */
    saveSeenBits() {
        return this.token
            .then(token => this.getSeenBits(token)
                .then(response => Promise.all(
                    [this.getViewedPostsFromSettings(), 
                     this.decodeSeenBits(response.value)
                        .then(arr => this.getViewedPostIds(arr))
                    ])
                    .then(arr => this.mergeViewedPosts(arr[1], arr[0]))
                    .then(ids => this.createSeenBits(ids))
                    .then(arr => this.encodeSeenBits(arr))
                    .then(enc => {
                        this.setSeenBits(token, response.version, enc);
                    }))
            );
    }

    /**
     * @param {Uint8Array} seenBits 
     * @returns {Promise<Uint8Array>} 
     */
    encodeSeenBits(seenBits) {
        return Promise.resolve(deflate(seenBits, { level: 9 }))
    }

    /**
     * @param {number[]} posts
     * @returns {Promise<Uint8Array>}
     */
    createSeenBits(posts) {
        return new Promise((resolve) => {
            const seenBits = new Uint8Array(8000000 / 8).fill(0);
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
     * 
     * @param {number[]} arr1 
     * @param {number[]} arr2 
     * @returns {Promise<number[]>} 
     */
    mergeViewedPosts(arr1, arr2) {
        return new Promise((resolve, reject) => {
            const newValues = arr2.filter((item) => arr1.indexOf(item) < 0); 
            console.log([arr1, arr2, newValues])
            if(newValues.length > 0) {
                resolve(arr1.concat(newValues));
            } else {
                reject('Nothing to merge')
            }
        });
    }

    /**
     * Decodes the seen Bits response into a Uint8Array, which contains information about
     * the viewed posts. The given string will be base64 decoded and then decompressed
     * using the Inflate Algorithm.
     * @param {string} str "value" from the KV-Response
     * @returns {Promise<Uint8Array>}
     */
    decodeSeenBits(str) {
        return new Promise((resolve, reject) => {
            this.seenBits = inflate(Buffer.from(str, 'base64'), { level: 9 });
            resolve(this.seenBits);
        });
    }

    /**
     * Returns p0werusers viewed posts, or a empty array if no post was marked as
     * seen yet.
     * @returns {Promise<number[]>}
     */
    getViewedPostsFromSettings() {
        return new Promise((resolve) => {
            let posts = Settings.get('viewed_posts');
            /** @type {number[]} */let arr = []

            if (posts !== true) {
                arr = JSON.parse(posts);
            } 
            resolve(arr)
        });
    }

    /**
     * Merges an array of post IDs into p0werusers viewed posts
     * @param {number[]} viewedIds IDs to merge
     */
    mergeIntoSettings(viewedIds) {
        this.getViewedPostsFromSettings()
            .then(idsFromSettings => this.mergeViewedPosts(viewedIds, idsFromSettings))
            .then(merged => {
                Settings.set('viewed_posts', JSON.stringify(merged));
            });
    }

    /**
     * Retrieve identifier from API
     * @returns {Promise<string>}
     */
    getIdentifier() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://pr0gramm.com/api/user/identifier",
                headers: {
                    Accept: "application/json"
                },
                onerror: (/**@type {Response}*/err) => {
                    reject(err);
                },
                onload: (/**@type {Response}*/res) => {
                    let body = JSON.parse(res.response);
                    let identifier = body.identifier;
                    if(identifier) {
                        resolve(identifier);
                    }
                    reject('Identifier not found')
                }
            })
        });
    }

    /**
     * Build a valid token from the identifier
     * @param {string} identifier 
     * @returns {Promise<string>}
     */
    buildToken(identifier) {
        return new Promise((resolve, reject) => {
            const base = `xxx${identifier}`
            if(base.length > 16) {
                const namespace = base.slice(0,16);
                const value = base.slice(16, base.length);
                const byteArray = new TextEncoder("utf-8").encode(namespace);

                resolve(uuidv3(value, byteArray));
            }
            reject("Could not build token from identifier");
        });
    }

    /**
     * Get Seen Bits from apps KV-Store
     * @param {string} token 
     * @typedef {Object} KVResponse
     * @property {number} version
     * @property {string} value
     * @returns {Promise<KVResponse>}
     */
    getSeenBits(token) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://app.pr0gramm.com/kv/v1/token/${token}/key/seen-bits`,
                headers: {
                    Accept: "application/json"
                },
                onerror: (/**@type {Response}*/err) => {
                    reject(err);
                },
                onload: (/**@type {Response}*/res) => {
                    let body = JSON.parse(res.response);
                    if(body && body.version && body.value) {
                        resolve(body);
                    }
                    reject('Could not read response');
                }
            })
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

    /**
     * Set the seen bits into KV-Store
     * @param {string} token 
     * @param {number} version 
     * @param {Uint8Array} value 
     */
    setSeenBits(token, version, value) {
        GM_xmlhttpRequest({
            method: "POST",
            url: `https://app.pr0gramm.com/kv/v1/token/${token}/key/seen-bits/version/${version}`,
            headers: {
                "Content-Type": "application/octet-stream",
                Accept: "application/json"
            },
            binary: true,
            data: new Blob([value]),
            onerror: (/**@type {Response}*/err) => {
                if(err.status == 409) {
                    console.error('Version conflict');
                }
                console.error(err);
            },
            onload: (/**@type {Response}*/res) => {
               const body = JSON.parse(res.response);
            }
        })
    }
}