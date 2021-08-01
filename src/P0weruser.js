import Chat from './module/Chat';
import Pr0p0ll from './module/Pr0p0ll';
import ViewedPostsMarker from './module/ViewedPostsMarker';
import Settings from './Settings';
import Utils from './Utils';
import EventHandler from './EventHandler';
import WidescreenMode from './module/WidescreenMode';
import RepostMarker from './module/RepostMarker';
import BenisInNavbar from './module/BenisInNavbar';
import scrollbarCSS from 'simplebar/dist/simplebar.css';
import AdvancedComments from './module/AdvancedComments';
import NotificationCenter from './module/NotificationCenter';
import DesktopNotifications from './module/DesktopNotifications';
import FilterMarks from './module/FilterMarks';
import Rep0st from './module/Rep0st';
import ImageOCR from './module/ImageOCR';
import AnonymousTitle from './module/AnonymousTitle';
import StatisticsLinkInNavbar from './module/StatisticsLinkInNavbar';

/**
 * @typedef {{
 *   load: () => void ,
 *   getSettings?: () => P0weruserSetting[]
 * }} P0weruserModule
 */

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   description: string
 * }} P0weruserSetting
 */

/**
 * @typedef {{
 *   audio: boolean,
 *   created: number,
 *   down: number,
 *   flags: number,
 *   fullsize: string,
 *   gift: number,
 *   height: number,
 *   id: number,
 *   image: string,
 *   mark: number,
 *   promoted: number,
 *   source: string,
 *   thumb: string,
 *   up: number,
 *   user: string,
 *   userId: number,
 *   width: number
 * }} ItemData
 */

export default class P0weruser {
    constructor() {
        Utils.addPrototypes();
        P0weruser.addStyles();
        this.eventHandler = new EventHandler();
        this.modules = this.getModules();
        this.settings = new Settings(this);

        // Load activated modules
        this.loadModules();
    }


    /**
     * Add Styles to the DOM
     */
    static addStyles() {
        // Add FontAwesome Icons
        let fa = document.createElement('link');
        fa.type = 'text/css';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
        document.getElementsByTagName('head')[0].appendChild(fa);

        // Add Simplebar style
        let scrollbar = document.createElement('style');
        scrollbar.innerText = scrollbarCSS;
        document.getElementsByTagName('head')[0].appendChild(scrollbar);
    }

    /**
     * @returns {string[]}
     */
    static getActivatedModules() {
        let modules = window.localStorage.getItem('activated_modules');

        if (!modules) {
            window.localStorage.setItem('activated_modules', '[]');
            Settings.addHint();
            return [];
        }

        return JSON.parse(modules);
    }

    /**
     * @param {string[]} selection 
     */
    static saveActivatedModules(selection) {
        window.localStorage.setItem('activated_modules', JSON.stringify(selection));
    }


    loadModules() {
        let activated = P0weruser.getActivatedModules();

        activated.forEach(module => {
            if(typeof this.modules[module] === 'object' && typeof this.modules[module].load === 'function') {
                this.modules[module].load();
                console.debug(`Loaded module: ${module}`);
            }
        });
    }


    /**
     * @returns {Record<string, P0weruserModule>}
     */
    getModules() {
        if (!this.modules) {
            this.modules = {
                'WidescreenMode': new WidescreenMode(),
                'RepostMarker': new RepostMarker(),
                'BenisInNavbar': new BenisInNavbar(),
                'AdvancedComments': new AdvancedComments(),
                'NotificationCenter': new NotificationCenter(),
                'DesktopNotifications': new DesktopNotifications(),
                'FilterMarks': new FilterMarks(),
                'Rep0st': new Rep0st(),
                'ImageOCR': new ImageOCR(),
                'Pr0p0ll': new Pr0p0ll(),
                'ViewedPostsMarker': new ViewedPostsMarker(),
                'Chat': new Chat(),
                'AnonymousTitle': new AnonymousTitle(),
                'StatisticsLinkInNavbar': new StatisticsLinkInNavbar(),
            };
        }
        return this.modules;
    }
}


// Load script
window.p0weruser = new P0weruser();

