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


const activatedModules = getActivatedModules();

const init = () => {
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
  }
};

// We defer the initialization process, so we can (at least partially) ensure the userscript is executed AFTER the pr0gramm script.
// It should be the case anyway as we're relying on @run-at document-end, but just to make sure and make it easier to reason about.
setTimeout(init, 0);
