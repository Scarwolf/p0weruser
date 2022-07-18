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
if (activatedModules.length > 0) {
    loadModules(activatedModules);

    // Maybe we have added some view routes, therefore moving the 404 view to the end. If there is more particular ordering 
    // necessary it must be done in the module.
    const route404 = p._routes.find(r => String(r.rule) === "/(.*)/");
    const route404Index = p._routes.indexOf(route404);
    p._routes.push(p._routes.splice(route404Index, 1)[0]);


    // Once the modules are loaded we need to trigger re-rendering again as we may have overridden views.
    // We use force navigation here to trigger re-rendering as we're not changing location.
    // As the native pr0gramm initializes first a view is already created. However, It is necessary that we let 
    // pr0gramm think we don't have a view yet as otherwise it will try to hide the current view.
    setTimeout(() => {
        p.currentView = null;
        p.navigateTo(p.location, p.NAVIGATE.FORCE);
    }, 0);
}