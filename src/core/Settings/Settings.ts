import { PoweruserModule } from '@/types';
import './settings.less';
// @ts-ignore
import template from '../../../assets/template/settingsTab.html?raw'; // TODO
import Utils from '@/Utils';

export default class Settings {
    readonly modules: PoweruserModule[];
    activatedModules: PoweruserModule[];
    tabs: any = {};
    tabContent: any = {};
    hintIsShown: boolean = false;

    constructor(modules: PoweruserModule[], activatedModules: PoweruserModule[]) {
        this.modules = modules;
        this.activatedModules = activatedModules;
        this.addListeners();
    }


    static clearSettings() {
        // clear module settings
        window.localStorage.setItem('activated_modules', '[]');

        // Reload pr0gramm
        p.reload();
    }


    static saveSettings(moduleList: HTMLDivElement) {
        let result = [];
        let actives: NodeListOf<HTMLElement> = moduleList.querySelectorAll(':checked');

        // Get list of checked modules
        for (const element of actives) {
            result.push(element.dataset.module);
        }
        window.localStorage.setItem('activated_modules', JSON.stringify(result));

        Settings.saveModuleSettings();

        window.location.href = '/settings/site';
    }


    static saveModuleSettings() {
        const elements: NodeListOf<HTMLInputElement> = document.querySelectorAll('#module-settings input');

        for (const element of elements) {
            switch (element.type) {
                case 'text':
                    Settings.set(element.id, element.value);
                    break;
                case 'number':
                    Settings.set(element.id, String(Number(element.value) || 1));
                    break;
                case 'checkbox':
                    console.log(element);
                    Settings.set(element.id, String(element.checked));
                    break;
            }
        }
    }


    static addHint() {
        if (!document.getElementById('settings_hint')) {
            const header = document.getElementById('head-content');
            if(header === null) {
                throw new Error("Header could not be found");
            }
            const hint = document.createElement('div');
            hint.id = 'settings_hint';
            hint.innerText = 'Bitte öffne die Einstellungen um p0weruser zu konfigurieren!';

            header.appendChild(hint);

            return true;
        }
    }

    static getVersion(): Promise<string> {
        let url = 'https://github.com/Scarwolf/p0weruser/raw/master/package.json';

        return new Promise((resolve, reject) => {
            GM.xmlHttpRequest({
                url: url,
                method: 'GET',
                headers: {
                    'cache-control': 'no-cache',
                    'Upgrade-Insecure-Requests': '1'
                },
                onload: (res) => {
                    const version = res.responseText.match('"version":.*"(.*)"');

                    resolve(version !== null ? version[1] : 'Not available!');
                },
                onerror: (res: any) => {
                    reject(res);
                }
            });
        });
    }


    addListeners() {
        window.addEventListener('settingsLoaded', () => {
            console.log("Settings loaded");
            this.addSettingsTab();
        })
    }


    addSettingsTab() {
        this.tabContent = document.querySelectorAll('.pane.form-page')[0];
        this.tabs = document.getElementsByClassName('tab-bar')[0];

        // Create button-element
        let button = document.createElement('a');
        button.innerText = 'p0weruser';
        button.href = '/settings/addons';

        // Add listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleSettingsTab(button);
        });

        // Append element to tab-lsit
        this.tabs.appendChild(button);
    }


    toggleSettingsTab(button: HTMLAnchorElement) {
        Utils.changeLocation('/settings/addons');
        let moduleList = document.createElement('div');
        let modules = this.modules;

        this.tabContent.innerHTML = template;
        let list = this.tabContent.querySelectorAll('#addon-list')[0];

        // Add list of modules
        this.modules.forEach((module) => {
            const checked = this.activatedModules.some(m => m.id === module.id);

            // Build module-row
            moduleList.innerHTML += `
                <input type="checkbox" 
                       class="box-from-label"
                       name="${module.id}" 
                       id="${module.id}" 
                       data-module="${module.id}" ${checked ? ' checked="checked"' : ''}>
                <label for="${module.id}">
                    ${module.name}
                    <span>${module.description}</span>
                </label>`;
        });

        list.appendChild(moduleList);
        this.tabs.getElementsByClassName('active')[0].classList.remove('active');
        button.classList.add('active');

        // Add module-settings
        this.addModuleSettings(moduleList);

        // Load Versioninfo
        this.loadVersionInfo();

        // Add listener to clear-button
        let clearButton = this.tabContent.getElementsByClassName('clear-settings-button')[0];
        clearButton.addEventListener('click', () => {
            if (window.confirm('Einstellungen wirklich zurücksetzen?')) {
                Settings.clearSettings();
            }
        });

        // Add save-button
        let saveButton = this.tabContent.querySelectorAll('#save-addon-settings')[0];
        saveButton.addEventListener('click', () => {
            Settings.saveSettings(moduleList);
        })
    }

    addModuleSettings(beforeElement: any) {
        const modules = this.modules;
        const activated = this.activatedModules;
        let wrapper = document.createElement('div');
        wrapper.id = 'module-settings';

        for (const element of activated) {
            let module = element;

            if(typeof module === 'object') {
                if (typeof module.getSettings === 'function') {
                    const settings = module.getSettings();
                    let headline = document.createElement('h3');
                    headline.innerText = module.name;
                    wrapper.append(headline);

                    for (const el of settings) {
                        const id = `${module.id}.settings.${el.id}`;
                        const currentValue = Settings.get(id);
                        let container = document.createElement('div');
                        container.className = 'box-from-label';

                        switch (el.type) {
                            case 'number':
                                const iValue = (currentValue === true) ? 1 : currentValue;
                                container.innerHTML = `<div class="text-type"><span class="title">${el.title}</span><span class="description">${el.description}</span><input id="${id}" type="number" value="${iValue}" /></div>`;
                                break;
                            case 'text':
                                const tValue = Utils.escapeHtml((currentValue === true) ? '' : currentValue);
                                container.innerHTML = `<div class="text-type"><span class="title">${el.title}</span><span class="description">${el.description}</span><input id="${id}" type="text" value="${tValue}" /></div>`;
                                break;
                            default:
                                container.innerHTML = `<input id="${id}" type="${el.type ? el.type : 'checkbox'}" class="box-from-label" ${currentValue ? 'checked' : ''} /><label for="${id}">${el.title}<span>${el.description}</span></label>`;
                                break;
                        }

                        headline.after(container);
                    }
                }
            }
        }

        beforeElement.after(wrapper);
    }


    static get(name: string) {
        const item = window.localStorage.getItem(name);

        if (item === null) {
            Settings.set(name, String(true));

            return true;
        }

        if (item === 'true' || item === 'false') {
            return (item === 'true');
        } else {
            return item;
        }
    }


    static set(name: string, value: string) {
        window.localStorage.setItem(name, value);

        return value;
    }


    loadVersionInfo() {
        const elems = {
            installed: document.getElementById('installed_version')!,
            release: document.getElementById('release_version')!,
        };

        elems.installed.innerText = GM.info.script.version;
        Settings.getVersion()
            .then((version: string) => {
                elems.release.innerText = version;
            });
    }
}
