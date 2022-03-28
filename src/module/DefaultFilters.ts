import Settings from '../Settings';
import { P } from '../types';

type Filter = 'SFW' | 'NSFW' | 'NSFL';

const filterFlags: Record<Filter, number> = {
    SFW: 0,
    NSFW: 1,
    NSFL: 2
};

declare const p: P;

export default class DefaultFilters {
    readonly id: string = 'DefaultFilter';
    readonly name: string = 'Standard Filter';
    readonly description: string = 'Standardfilter, der mit dem Aufruf von pr0 gesetzt wird. ' + 
                                    'Der Filter greift <b><u>nur</u> beim Aufruf der Content-Seite und beim Wechseln ' +
                                    'zwischen SFW/NSFW/NSFL.</b> ' + 
                                    'Danach kann der Filter vom User angepasst werden. Der Filter greift ' + 
                                    '<b><u>nicht</u> beim Betrachten von User-Uploads oder Sammlungen</b>';
    readonly sfwFilter = Settings.get(`${this.id}.settings.sfw_filter`) as string;
    readonly nsfwFilter = Settings.get(`${this.id}.settings.nsfw_filter`) as string;
    readonly nsflFilter = Settings.get(`${this.id}.settings.nsfl_filter`) as string;

    constructor() { }


    getSettings() {
        return [
            {
                id: 'sfw_filter',
                title: 'SFW Filter',
                description: 'Standardfilter für SFW (ohne führendes !) <br />' +
                             'Beispiele:' +
                             '<ul>' + 
                             '<li> oc | "original content"</li>' + 
                             '<li> s:shit | s:500 & (oc | "original content")</li>' +
                             '</ul>',
                type: 'text'
            },
            {
                id: 'nsfw_filter',
                title: 'NSFW Filter',
                description: 'Standardfilter für NSFW (ohne führendes !) <br />' +
                             'Beispiele:' +
                             '<ul>' + 
                             '<li> oc | "original content"</li>' + 
                             '<li> s:shit | s:500 & (oc | "original content")</li>' +
                             '</ul>',
                type: 'text'
            },
            {
                id: 'nsfl_filter',
                title: 'NSFL Filter',
                description: 'Standardfilter für NSFL (ohne führendes !) <br />' +
                             'Beispiele:' +
                             '<ul>' + 
                             '<li> oc | "original content"</li>' + 
                             '<li> s:shit | s:500 & (oc | "original content")</li>' +
                             '</ul>',
                type: 'text'
            },
        ];
    }


    load() {
        if(p.location === 'top' || p.location === 'new') {
            const filter = this.getFilter();
            if(filter) {
                window.location.href = '/new/' + encodeURIComponent(filter);
            }
        }
    }

    /**
     * 
     * @returns {string}
     */
    getFilter() {
        const currFilters = this.getCurrentFilters();
        let selectedFilters = [];
        if(currFilters.includes(filterFlags.SFW)) {
            selectedFilters.push(`(${this.sfwFilter.trim()})`);
        }
        if(currFilters.includes(filterFlags.NSFW)) {
            selectedFilters.push(`(${this.nsfwFilter.trim()})`);
        }
        if(currFilters.includes(filterFlags.NSFL)) {
            selectedFilters.push(`(${this.nsflFilter.trim()})`);
        }
        
        if(selectedFilters.length > 0) {
            return "! " + selectedFilters.join(" | ");
        }
        return "";      
    }

    /**
     * 
     * @returns {Array<filters>}
     */
    getCurrentFilters() {
        const flags = Number(p.user.flags);
        if(isNaN(flags)) {
            throw new Error("Flags could not be parsed");
        }

        const active_filters = [];

        // SFW
        if((flags & 1 << 0) !== 0) {
            active_filters.push(filterFlags.SFW);
        }

        // NSFW
        if((flags & 1 << 1) !== 0) {
            active_filters.push(filterFlags.NSFW);
        }

        // NSFL
        if((flags & 1 << 2) !== 0) {
            active_filters.push(filterFlags.NSFL);
        }

        return active_filters;
    }
}
