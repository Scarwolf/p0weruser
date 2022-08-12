import { ItemResult, PoweruserModule, StreamItem } from '@/types';
import Utils, { loadStyle } from '@/Utils';
// @ts-ignore
import style from './repostMarker.less?inline';

// Inspired by Mopsalarms repost-script
// https://github.com/mopsalarm/pr0gramm-reposts-userscript
export default class RepostMarker implements PoweruserModule {
    readonly id = 'RepostMarker';
    readonly name = 'Repost Markierung';
    readonly description = 'Markiert Reposts in der Übersicht';


    static markRepost(id: string | number) {
        let elem = document.getElementById('item-' + id);

        if (elem) {
            elem.classList.add('repost');
        }
    }


    async load() {
        const originalStreamLoadFn = p.Stream.prototype._load;
        const _this = this;
        p.Stream.prototype._load = function (options: any, callback: any) {
            const result = originalStreamLoadFn.call(this, options, callback);
            _this.loadReposts(options);
            return result;
        };
        const currentStream = p.currentView?.stream;
        if (currentStream) {
            await this.loadReposts(currentStream.options);
        }
        loadStyle(style);
    }

    async loadReposts(options: any) {
        const data = await new Promise<ItemResult>((resolve, reject) => {
            p.api.get('items.get', { ...options, tags: "repost" }, resolve, reject);
        });

        for (const item of data.items) {
            RepostMarker.markRepost(item.id);
        }
    }
}
