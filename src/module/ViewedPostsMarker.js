import Settings from '../Settings';
import Utils from '../Utils';

export default class ViewedPostsMarker {
    constructor() {
        this.id = 'ViewedPostsMarker';
        this.name = '"Bereits gesehen"-Markierung';
        this.description = 'Markiert bereits gesehene Medien.';
        this.markOwnFavoritesAsViewed = Settings.get('ViewedPostsMarker.settings.mark_own_favorites_as_viewed');
    }

    load() {
        let _this = this;
        this.styles = require('../style/viewedPostsMarker.less');
        this.viewedPosts = ViewedPostsMarker.getViewedPosts();

        // TODO: Fire event only once
        $(document).ajaxComplete(async (event, request, settings) => {
            /* Since this is a global event handler for every ajax we need to specify on which event 
             * it should be fired. This is the case for every event which accesses items.
             */
            if(settings.url.startsWith('/api/items/get')) {
                if(this.markOwnFavoritesAsViewed || !(await this.wouldLoadUserCollection(settings.url))) {   
                    this.viewedPosts.forEach(post => {
                        ViewedPostsMarker.markAsViewed(post);
                    });
                }
            }
        });

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex, itemData, defaultHeight, jumpToComment) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                _this.addViewedPost(itemData.id);
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();
    }

    static markAsViewed(id) {
        let elem = document.getElementById('item-' + id);

        if (elem) {
            elem.classList.add('viewed');
        }
    }

    static getViewedPosts() {
        let posts = Settings.get('viewed_posts');

        if (posts === true) {
            return [];
        }

        return JSON.parse(posts);
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

    addViewedPost(id) {
        if (this.viewedPosts.length >= 10000) {
            this.viewedPosts = this.viewedPosts.slice(-10000);
        }

        if (this.viewedPosts.indexOf(id) === -1) {
            this.viewedPosts.push(id);
        }

        Settings.set('viewed_posts', JSON.stringify(this.viewedPosts));
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
}
