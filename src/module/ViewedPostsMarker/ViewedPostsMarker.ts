import Settings from '../../Settings';
import Utils from '../../Utils';
import './viewedPostsMarker.less';

export default class ViewedPostsMarker {
    readonly id = 'ViewedPostsMarker';
    readonly name = '"Bereits gesehen"-Markierung';
    readonly description = 'Markiert bereits gesehene Medien.';
    readonly markOwnFavoritesAsViewed = Settings.get('ViewedPostsMarker.settings.mark_own_favorites_as_viewed');

    viewedPosts: number[] = ViewedPostsMarker.getViewedPosts();

    load() {
        let _this = this;

        // TODO: Fire event only once
        $(document).ajaxComplete((event, request, settings) => {
            /* Since this is a global event handler for every ajax we need to specify on which event 
             * it should be fired. This is the case for every event which accesses items.
             */
            if(settings.url!.startsWith('/api/items/get')) {
                if(this.markOwnFavoritesAsViewed || !(this.wouldLoadUserCollection(settings.url!))) {   
                    this.viewedPosts.forEach((post: number) => {
                        ViewedPostsMarker.markAsViewed(post);
                    });
                }
            }
        });

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex: any, itemData: any, defaultHeight: any, jumpToComment: any) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                _this.addViewedPost(itemData.id);
                ViewedPostsMarker.markAsViewed(itemData.id);
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();
    }

    static markAsViewed(id: number) {
        let elem = document.getElementById('item-' + id);

        if (elem) {
            elem.classList.add('viewed');
        }
    }

    static getViewedPosts(): number[] {
        let posts = Settings.get('viewed_posts');

        if (posts === true) {
            return [];
        }

        return JSON.parse(posts as string);
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

    addViewedPost(id: number) {
        console.log(id);
        if (this.viewedPosts.length >= 10000) {
            this.viewedPosts = this.viewedPosts.slice(-10000);
        }

        if (this.viewedPosts.indexOf(id) === -1) {
            this.viewedPosts.push(id);
        }

        Settings.set('viewed_posts', JSON.stringify(this.viewedPosts));
    }

    /**
     * Checks any url whether this url would load any of the logged in users collection
     */
    wouldLoadUserCollection(url: string): boolean {
        const name = p.user.name;
        const queryParams = new URLSearchParams(url);

        // If the current request would retrieve any of the users collection
        return queryParams.has("collection") && queryParams.get("user") === name;
    }
}
