import Chat from './module/Chat/Chat';
import Pr0p0ll from './module/Pr0poll/Pr0p0ll';
import ViewedPostsMarker from './module/ViewedPostsMarker/ViewedPostsMarker';
import Settings from './Settings';
import Utils from './Utils';
import EventHandler from './EventHandler';
import WidescreenMode from './module/WidescreenMode/WidescreenMode';
import RepostMarker from './module/RepostMarker/RepostMarker';
import NotificationCenter from './module/NotificationCenter/NotificationCenter';
import DesktopNotifications from './module/DesktopNotifications/DesktopNotifications';
import StatisticsLinkInNavbar from './module/StatisticsInNavbar/StatisticsLinkInNavbar';
import StyleCustomization from './module/StyleCustomization/StyleCustomization';
import { PoweruserModule } from './types';
import AdvancedComments from './module/AdvancedComments/AdvancedComments';
import AnonymousTitle from './module/AnonymousTitle/AnonymousTitle';
import BenisInNavbar from './module/BenisInNavbar/BenisInNavbar';
import DefaultFilters from './module/DefaultFilters/DefaultFilters';
import FilterMarks from './module/FilterMarks/FilterMarks';
import ImageOCR from './module/ImageOCR/ImageOCR';
import Rep0st from './module/Rep0st/Rep0st';

export const modules: PoweruserModule[] = [
    new StyleCustomization(),
    new AdvancedComments(),
    new AnonymousTitle(), 
    new BenisInNavbar(),
    new Chat(),
    new DefaultFilters(),
    new DesktopNotifications(),
    new FilterMarks(),
    new ImageOCR(),
    new Rep0st(),
    new RepostMarker(),
    new StatisticsLinkInNavbar(),
    new ViewedPostsMarker(),
    new NotificationCenter(),
    new Pr0p0ll(),
    new WidescreenMode()
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
const loadModules = (modules: PoweruserModule[]) => modules.forEach(m => loadModule(m));
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


Utils.addPrototypes();
new EventHandler();
new Settings();
addStyles();
const activatedModules = getActivatedModules();
loadModules(activatedModules);