import Chat from './module/Chat';
import Pr0p0ll from './module/Pr0p0ll';
import ViewedPostsMarker from './module/ViewedPostsMarker';
import Settings from './Settings';
import Utils from './Utils';
import EventHandler from './EventHandler';
import WidescreenMode from './module/WidescreenMode';
import RepostMarker from './module/RepostMarker';
import BenisInNavbar from './module/BenisInNavbar';
import AdvancedComments from './module/AdvancedComments';
import NotificationCenter from './module/NotificationCenter';
import DesktopNotifications from './module/DesktopNotifications';
import FilterMarks from './module/FilterMarks';
import Rep0st from './module/Rep0st';
import ImageOCR from './module/ImageOCR';
import AnonymousTitle from './module/AnonymousTitle';
import StatisticsLinkInNavbar from './module/StatisticsLinkInNavbar';
import DefaultFilters from './module/DefaultFilters';
import StyleCustomization from './module/StyleCustomization';
import { PoweruserModule } from './types';

export const modules: PoweruserModule | any[] = [
    new WidescreenMode(),
    new RepostMarker(),
    new BenisInNavbar(),
    new AdvancedComments(),
    new NotificationCenter(),
    new DesktopNotifications(),
    new FilterMarks(),
    new Rep0st(),
    new ImageOCR(),
    new Pr0p0ll(),
    new ViewedPostsMarker(),
    new Chat(),
    new AnonymousTitle(),
    new StatisticsLinkInNavbar(),
    new DefaultFilters(),
    new StyleCustomization()
];

const getActivatedModules = (): PoweruserModule[] => {
    const setting = window.localStorage.getItem('activated_modules');
    if (setting === null) {
        window.localStorage.setItem('activated_modules', '[]');
        Settings.addHint();
        return [];
    }
    const activeModuleIds: string[] = JSON.parse(setting);
    return modules.filter(m => activeModuleIds.includes(m.id));
}


const loadModule = (module: PoweruserModule) => {
    module.load();
    console.debug(`Loaded module: ${module.id}`);
}
const loadModules = (module: PoweruserModule[]) => module.forEach(m => loadModule(m));
const addStyles = () => {
    // FontAwesome (Icons)
    let fa = document.createElement('link');
    fa.type = 'text/css';
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.getElementsByTagName('head')[0].appendChild(fa);

    let scrollbar = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(scrollbar);
};

export default function() {
    Utils.addPrototypes();
    new EventHandler();
    addStyles();
    loadModules(getActivatedModules());
}