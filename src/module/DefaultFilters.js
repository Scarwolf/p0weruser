import { P } from 'core-js/modules/_export';
import Settings from '../Settings';
import Utils from '../Utils';

/**
 * @enum
 */
const filters = {
    SFW: 0,
    NSFW: 1,
    NSFL: 2
};

export default class DefaultFilters {

    constructor() {
        this.id = 'DefaultFilter';
        this.name = 'Standard Filter';
        this.description = 'Standardfilter, der mit dem Aufruf von pr0 gesetzt wird';

        this.sfwFilter = Settings.get(`${this.id}.settings.sfw_filter`);
        this.nsfwFilter = Settings.get(`${this.id}.settings.nsfw_filter`);
        this.nsflFilter = Settings.get(`${this.id}.settings.nsfl_filter`);
    }


    getSettings() {
        return [
            {
                id: 'sfw_filter',
                title: 'SFW Filter',
                description: 'Standardfilter für SFW (ohne führendes !)',
                type: 'text'
            },
            {
                id: 'nsfw_filter',
                title: 'NSFW Filter',
                description: 'Standardfilter für NSFW (ohne führendes !)',
                type: 'text'
            },
            {
                id: 'nsfl_filter',
                title: 'NSFL Filter',
                description: 'Standardfilter für NSFL (ohne führendes !)',
                type: 'text'
            },
        ];
    }


    load() {
        // TODO: It should be only loaded the FIRST TIME the page is loaded and should never 
        // override custom filters
        $('#search-form-inline > input[type="text"]').val(that.getFilters());
        $('.search-submit-wrap > input[type="submit"]').submit();
    }

    /**
     * 
     * @returns {string}
     */
    getFilters() {
        const currFilters = this.getCurrentFilters();
        let selectedFilters = [];
        if(currFilters.includes(filters.SFW)) {
            selectedFilters.push(`(${this.sfwFilter.trim()})`);
        }
        if(currFilters.includes(filters.NSFW)) {
            selectedFilters.push(`(${this.nsfwFilter.trim()})`);
        }
        if(currFilters.includes(filters.NSFL)) {
            selectedFilters.push(`(${this.nsflFilter.trim()})`);
        }
        console.log(selectedFilters);
        
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
            active_filters.push(filters.SFW);
        }

        // NSFW
        if((flags & 1 << 1) !== 0) {
            active_filters.push(filters.NSFW);
        }

        // NSFL
        if((flags & 1 << 2) !== 0) {
            active_filters.push(filters.NSFL);
        }

        console.log(active_filters);

        return active_filters;
    }
}
