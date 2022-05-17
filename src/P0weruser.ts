import Utils from './Utils';
import EventHandler from './EventHandler';
import { PoweruserModule } from './types';
import Settings from './core/Settings/Settings';
import { modules } from './module';

const allModules = Object.values(modules)
    .map(m => m());

const getActivatedModules = (): PoweruserModule[] => {
    const setting = window.localStorage.getItem('activated_modules');
    if (setting === null) {
        window.localStorage.setItem('activated_modules', '[]');
        Settings.addHint();
        return [];
    }
    const activeModuleIds: string[] = JSON.parse(setting);
    return allModules
        .filter(m => activeModuleIds.includes(m.id));
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


const activatedModules = getActivatedModules();

Utils.addPrototypes();
new EventHandler();
new Settings(allModules, activatedModules);
addStyles();
loadModules(activatedModules);