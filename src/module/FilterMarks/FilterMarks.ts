import Settings from '@/core/Settings/Settings';
import { ModuleSetting, PoweruserModule, StreamItem } from '@/types';
import Utils, { loadStyle } from '@/Utils';
// @ts-ignore
import style from './filterMarks.less?inline';

export default class FilterMarks implements PoweruserModule{
    readonly id = 'FilterMarks';
    readonly name = 'Filtermarkierung';
    readonly description = 'Markiert Medien entsprechend ihres Filters.';

    displayLabelDetails = Settings.get('FilterMarks.settings.detail_filters');
    displayLabelStream = Settings.get('FilterMarks.settings.stream_filters');
    displayBenisStream = Settings.get('FilterMarks.settings.stream_benis');


    static displayFilterLabel(itemData: any, $container: any) {
        let filter = FilterMarks.getFilter(itemData);
        let badge = document.createElement('span');
        badge.className = 'badge';
        badge.classList.toggle(filter);
        badge.innerText = filter.toUpperCase();

        $container.find('.item-details')[0].appendChild(badge);
    }


    static getFilter(itemData: any) {
        switch (itemData.flags) {
            case 1:
                return 'sfw';
            case 2:
                return 'nsfw';
            case 4:
                return 'nsfl';
            case 8:
                return 'nsfp';
            default:
                throw new Error("Uknown Filter");
        }
    }


    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'stream_filters',
                title: 'Filter in Streams',
                description: 'Filterecken in Listen anzeigen?',
                type: "checkbox"
            },
            {
                id: 'detail_filters',
                title: 'Filter in Medienansicht',
                description: 'Filterlabel in der Detailansicht einblenden?',
                type: "checkbox"
            },
            {
                id: 'stream_benis',
                title: 'Benis beim Mouseover',
                description: 'Benis in der Übersicht einblenden?',
                type: "checkbox"
            }
        ];
    }


    async load() {
        this.overrideViews();
        loadStyle(style);
    }


    overrideViews() {
        let _this = this;

        if(this.displayLabelStream || this.displayBenisStream) {
            // Handle stream-view
            const original = p.View.Stream.Main.prototype.buildItem; // Prevent the original call
            p.View.Stream.Main.prototype.buildItem = function (item: StreamItem) {
                const originalResult = original(item); // build original item
                
                // Parse to HTMLElement
                const dummyElement = document.createElement("span");
                dummyElement.innerHTML = originalResult;
                const child = dummyElement.firstChild! as HTMLAnchorElement;
                // TODO: Link building is not possible within the original function, because this.baseURL is undefined.
                //       I don't know why and its late, so do it here again.
                child.href = this.baseURL + item.id;
                if(_this.displayLabelStream) {
                    child.classList.add("filter", FilterMarks.getFilter(item));
                }
                if(_this.displayBenisStream) {
                    const benisInfoSpan = document.createElement("span");
                    const benisAmount = item.up - item.down;
                    benisInfoSpan.classList.add("benis-info", benisAmount ? 'up' : 'down');
                    benisInfoSpan.innerText = String(benisAmount);
                    child.append(benisInfoSpan);
                }

                return dummyElement.innerHTML;
            };
        }

        if(this.displayLabelDetails) {
            // Handle detail-view
            p.View.Stream.Item = p.View.Stream.Item.extend({
                show: function (rowIndex: any, itemData: any, defaultHeight: any, jumpToComment: any) {
                    this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                    if (_this.displayLabelDetails) {
                        FilterMarks.displayFilterLabel(itemData, this.$container);
                    }
                }
            });
        }

        // Fix audio-controls
        Utils.addVideoConstants();
    }
}
