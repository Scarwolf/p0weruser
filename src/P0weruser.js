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


    static addStyles() {
        // FontAwesome (Icons)
        let fa = document.createElement('link');
        fa.type = 'text/css';
        fa.rel = 'stylesheet';
        fa.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
        document.getElementsByTagName('head')[0].appendChild(fa);

        let scrollbar = document.createElement('style');
        scrollbar.innerText = scrollbarCSS;
        document.getElementsByTagName('head')[0].appendChild(scrollbar);
    }


    static getActivatedModules() {
        let modules = window.localStorage.getItem('activated_modules');

        if (!modules) {
            window.localStorage.setItem('activated_modules', '[]');
            modules = '[]';
        }

        if (modules === '[]') {
            Settings.addHint();
        }

        return JSON.parse(modules);
    }

    static saveActivatedModules(selection) {
        window.localStorage.setItem('activated_modules', JSON.stringify(selection));
    }


    loadModules() {
        let activated = P0weruser.getActivatedModules();

        for (let i = 0; i < activated.length; i++) {
            this.modules[activated[i]].load();
            console.debug(`Loaded module: ${activated[i]}`);
        }
    }


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

