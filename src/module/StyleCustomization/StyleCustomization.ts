import Settings from "@/core/Settings/Settings";
import { ModuleSetting, PoweruserModule } from "@/types";
import Utils, { loadStyle } from '@/Utils';
// @ts-ignore
import style from './styleCustomization.css?inline';

export default class StyleCustomization implements PoweruserModule {
    readonly id = 'StyleCustomization';
    readonly name = 'Stilisierung';
    readonly description = 'Einzelne Styleanpassungen';
    isTransparentNavbarEnabled = Settings.get(`${this.id}.settings.transparent_navbar`);


    async load() {
        if (this.isTransparentNavbarEnabled === true) {
            document.getElementById("head")?.classList.add("transparent");
        }
        loadStyle(style);
    }

    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'transparent_navbar',
                title: 'Transparente Navigationsleiste',
                description: 'Die Navigationsleiste wird transparent angezeigt. Inspieriert von <a href="https://github.com/holzmaster/augenzuckerl">Augenzuckerl</a> von <a href="https://pr0gramm.com/user/holzmaster">@holzmaster</a>. Außerdem wird das Navigationsmenü auch im Widescreen Mode zentriert dargestellt.',
                type: "checkbox"
            }
        ];
    }
}