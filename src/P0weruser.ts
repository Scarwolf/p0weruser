import Utils from './Utils';
import EventHandler from './EventHandler';
import { PoweruserModule } from './types';
import Settings from './core/Settings/Settings';
import { modules } from "./module";
import styles from "./style.css?inline";

const allModules = Object.values(modules).map((m) => m());
const loadedModules: PoweruserModule[] = [];

const getActivatedModules = (): PoweruserModule[] => {
  const setting = window.localStorage.getItem("activated_modules");
  if (setting === null) {
    window.localStorage.setItem("activated_modules", "[]");
    Settings.addHint();
    return [];
  }
  const activeModuleIds: string[] = JSON.parse(setting);
  return allModules.filter((m) => activeModuleIds.includes(m.id));
};

const isLoaded = (module: PoweruserModule) =>
  loadedModules.some((m) => m.id === module.id);

const loadModule = async (module: PoweruserModule) => {
  if (isLoaded(module)) {
    return;
  }
  await module.load();
  loadedModules.push(module);
  console.debug(`Loaded module: ${module.id}`);
};
const loadModules = async (modulesToLoad: PoweruserModule[]) =>
  Promise.all(modulesToLoad.map((m) => loadModule(m)));
const addStyles = () => {
  // FontAwesome (Icons)
  let fa = document.createElement("link");
  fa.type = "text/css";
  fa.rel = "stylesheet";
  fa.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
  document.getElementsByTagName("head")[0].appendChild(fa);

  let globalStyle = document.createElement("style");
  globalStyle.textContent = styles;
  document.getElementsByTagName("head")[0].appendChild(globalStyle);
};

// We defer the initialization and hope that pr0gramm has been initialized before
setTimeout(() => {
  const activatedModules = getActivatedModules();

  Utils.addPrototypes();
  new EventHandler();
  new Settings(allModules, activatedModules);
  addStyles();
  if (activatedModules.length > 0) {
    loadModules(activatedModules);

    // Maybe we have added some view routes, therefore moving the 404 view to the end. If there is more particular ordering
    // necessary it must be done in the module.
    const route404 = p._routes.find((r) => String(r.rule) === "/(.*)/");
    const route404Index = p._routes.indexOf(route404);
    p._routes.push(p._routes.splice(route404Index, 1)[0]);

    // Once the modules are loaded we need to trigger re-rendering again as we may have overridden views.
    // We use force navigation here to trigger re-rendering as we're not changing location.
    // As the native pr0gramm initializes first a view is already created. However, It is necessary that we let
    // pr0gramm think we don't have a view yet as otherwise it will try to hide the current view.
    if (loadedModules.some((m) => m.needsReRendering)) {
      setTimeout(() => {
        p.currentView = null;

        // We navigate using the full URL to ensure that the view is re-rendered with all parameters.
        // If we would use p.location, some URL parts will be trimmed down, for example the ":comment" suffix.
        p.navigateTo(p.getURL(), p.NAVIGATE.FORCE);
      }, 0);
    }
  }
}, 0);
