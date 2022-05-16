import Settings from '@/core/Settings/Settings';
import { ModuleSetting, PoweruserModule } from '@/types';
import Utils from '@/Utils';
import './filterMarks.less';

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


    load() {
        this.overrideViews();
    }


    overrideViews() {
        let _this = this;

        // Handle stream-view
        p.View.Stream.Main.prototype.buildItem = function (item: any) {
            let content = `<a class="silent thumb filter ${_this.displayLabelStream ? FilterMarks.getFilter(item) : ''}" id="item-${item.id}" href="${this.baseURL + item.id}"><img onload="this.classList.add(\'loaded\')" src="${item.thumb}"/> ${item.promoted > 1000000000 ? '<div class="sticky-badge"></div>' : ''}`;

            if (_this.displayBenisStream) {
                content += `<span class="benis-info ${item.up - item.down > 0 ? 'up' : 'down'}">${item.up - item.down}</span></a>`;
            }
            else {
                content += '</a>';
            }
            return content;
        };

        // Handle detail-view
        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex: any, itemData: any, defaultHeight: any, jumpToComment: any) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                if (_this.displayLabelDetails) {
                    FilterMarks.displayFilterLabel(itemData, this.$container);
                }
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();
    }
}
