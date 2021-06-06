import Settings from '../Settings';
import Utils from '../Utils';

export default class ViewedPostsMarker {
    constructor() {
        this.id = 'ViewedPostsMarker';
        this.name = '"Bereits gesehen"-Markierung';
        this.description = 'Markiert bereits gesehene Medien.';
    }

    load() {
        let _this = this;
        this.styles = require('../style/viewedPostsMarker.less');
        this.viewedPosts = ViewedPostsMarker.getViewedPosts();

        $(document).ajaxComplete((event, request, settings) => {
            for (let post of this.viewedPosts) {
                ViewedPostsMarker.markAsViewed(post);
            }
        });

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex, itemData, defaultHeight, jumpToComment) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                _this.addViewedPost(itemData.id);
            }
        });

        //TODO: Async
        window.addEventListener('storage', () => {
            const newIds = ViewedPostsMarker.getViewedPosts().filter((item) => this.viewedPosts.indexOf(item) < 0);
            this.viewedPosts.push(...newIds);
            for (let post of newIds) {
                ViewedPostsMarker.markAsViewed(post);
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

    addViewedPost(id) {
        if (this.viewedPosts.length >= 10000) {
            this.viewedPosts = this.viewedPosts.slice(-10000);
        }

        if (this.viewedPosts.indexOf(id) === -1) {
            this.viewedPosts.push(id);
        }

        Settings.set('viewed_posts', JSON.stringify(this.viewedPosts));
    }
}
