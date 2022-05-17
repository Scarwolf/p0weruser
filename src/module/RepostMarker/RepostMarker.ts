import { PoweruserModule } from '@/types';
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
        // Get reposts, if not searched before
        $(document).ajaxComplete((event, request, settings) => {
            this.handleAjax(settings.url!).then((data: any) => {
                for (let id of data) {
                    RepostMarker.markRepost(id);
                }
            });
        });
        loadStyle(style);
    }

    handleAjax(url: string) {
        return new Promise((resolve, reject) => {
            if (url.indexOf('/api/items/get') === -1 || url.indexOf('repost') !== -1) {
                return false
            }

            const urlParams = Utils.getUrlParams(url);
            const params: any = urlParams.params;
            if (!params.tags) {
                params.tags = 'repost';
            } else {
                params.tags = 'repost ' + params.tags;
            }

            // Send manipulated request
            let xhr = new XMLHttpRequest();
            xhr.open('GET', Utils.getUrlFromParams(urlParams.url, params));
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let response = JSON.parse(xhr.responseText);
                    resolve(response.items.map((item: any) => {
                        return item.id;
                    }));
                } else {
                    reject('error!');
                }
            });

            xhr.send();
        });
    }
}
