import settingsTpl from './template/settingsTab.html';
import settingsStyle from './style/settings.less';
import Utils from './Utils';
import P0weruser from './P0weruser';

export default class Settings {
    constructor(app) {
        this.style = settingsStyle;
        this.app = app;
        this.tabs = {};
        this.tabContent = {};
        this.hintIsShown = false;

        this.addListeners();
    }


    static clearSettings() {
        // clear module settings
        window.localStorage.setItem('activated_modules', '[]');

        // Reload pr0gramm
        p.reload();
    }


    static saveSettings(moduleList) {
        let result = [];
        let actives = moduleList.querySelectorAll(':checked');

        // Get list of checked modules
        for (let i = 0; i < actives.length; i++) {
            result.push(actives[i].dataset.module);
        }
        P0weruser.saveActivatedModules(result);

        Settings.saveModuleSettings();

        window.location.href = '/settings/site';
    }


    static saveModuleSettings() {
        const elements = document.querySelectorAll('#module-settings input');

        for (let i = 0; i < elements.length; i++) {
            switch (elements[i].type) {
                case 'text':
                    Settings.set(elements[i].id, elements[i].value);
                    break;
                case 'number':
                    Settings.set(elements[i].id, parseInt(elements[i].value) || 1);
                    break;
                case 'checkbox':
                    console.log(elements[i]);
                    Settings.set(elements[i].id, elements[i].checked);
                    break;
            }
        }
    }


    static addHint() {
        if (!document.getElementById('settings_hint')) {
            let header = document.getElementById('head-content');
            let hint = document.createElement('div');
            hint.id = 'settings_hint';
            hint.innerText = 'Bitte öffne die Einstellungen um p0weruser zu konfigurieren!';

            header.appendChild(hint);

            return true;
        }
    }


    static getVersion(getBeta) {
        let url = 'https://github.com/Scarwolf/p0weruser/raw/master/package.json';

        if (getBeta) {
            url = 'https://github.com/Scarwolf/p0weruser/raw/develop/package.json';
        }

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: url,
                method: 'GET',
                headers: {
                    'cache-control': 'no-cache',
                    'Upgrade-Insecure-Requests': 1
                },
                onload: (res) => {
                    const version = res.responseText.match('"version":.*"(.*)"');

                    resolve(version !== null ? version[1] : 'Not available!');
                },
                onError: (res) => {
                    reject(res);
                }
            });
        });
    }


    addListeners() {
        window.addEventListener('settingsLoaded', () => {
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


    toggleSettingsTab(button) {
        Utils.changeLocation('/settings/addons');
        let moduleList = document.createElement('div');
        let modules = this.app.modules;

        this.tabContent.innerHTML = settingsTpl;
        let list = this.tabContent.querySelectorAll('#addon-list')[0];

        // Add list of modules
        Object.keys(modules).forEach((key) => {
            let checked = P0weruser.getActivatedModules().indexOf(key) !== -1;

            // Build module-row
            moduleList.innerHTML += `
                <input type="checkbox" 
                       class="box-from-label"
                       name="${key}" 
                       id="${key}" 
                       data-module="${key}" ${checked ? ' checked="checked"' : ''}>
                <label for="${key}">
                    ${modules[key].name}
                    <span>${modules[key].description}</span>
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

    addModuleSettings(beforeElement) {
        const modules = this.app.modules;
        const activated = P0weruser.getActivatedModules();
        let wrapper = document.createElement('div');
        wrapper.id = 'module-settings';

        for (let i = 0; i < activated.length; i++) {
            let module = modules[activated[i]];

            if(typeof module !== undefined) {
                if (typeof module.getSettings === 'function') {
                    const settings = module.getSettings();
                    let headline = document.createElement('h3');
                    headline.innerText = module.name;
                    wrapper.append(headline);

                    for (let i = 0; i < settings.length; i++) {
                        const id = `${module.id}.settings.${settings[i].id}`;
                        let currentValue = Settings.get(id);
                        let container = document.createElement('div');
                        container.className = 'box-from-label';

                        switch (settings[i].type) {
                            case 'number':
                                currentValue = (currentValue === true) ? 1 : currentValue;
                                container.innerHTML = `<div class="text-type"><span class="title">${settings[i].title}</span><span class="description">${settings[i].description}</span><input id="${id}" type="number" value="${currentValue}" /></div>`;
                                break;
                            case 'text':
                                currentValue = (currentValue === true) ? '' : currentValue;
                                container.innerHTML = `<div class="text-type"><span class="title">${settings[i].title}</span><span class="description">${settings[i].description}</span><input id="${id}" type="text" value="${currentValue}" /></div>`;
                                break;
                            default:
                                container.innerHTML = `<input id="${id}" type="${settings[i].type ? settings[i].type : 'checkbox'}" class="box-from-label" ${currentValue ? 'checked' : ''} /><label for="${id}">${settings[i].title}<span>${settings[i].description}</span></label>`;
                                break;
                        }

                        headline.after(container);
                    }
                }
            }
        }

        beforeElement.after(wrapper);
    }


    static get(name) {
        const item = window.localStorage.getItem(name);

        if (item === null) {
            Settings.set(name, true);

            return true;
        }

        if (item === 'true' || item === 'false') {
            return (item === 'true');
        } else {
            return item;
        }
    }


    static set(name, value) {
        window.localStorage.setItem(name, value);

        return value;
    }


    loadVersionInfo() {
        let elems = {
            installed: document.getElementById('installed_version'),
            release: document.getElementById('release_version'),
            beta: document.querySelectorAll('#beta_version > span')[0]
        };

        elems.installed.innerText = GM_info.script.version;
        Settings.getVersion(false).then((version) => {
            elems.release.innerText = version;
        });
        Settings.getVersion(true).then((version) => {
            elems.beta.innerText = version;
        });
    }
}
