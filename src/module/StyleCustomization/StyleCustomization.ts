import Settings from "@/core/Settings/Settings";
import { ModuleSetting, PoweruserModule } from "@/types";
import Utils, { loadStyle } from "@/Utils";
import style from "./styleCustomization.less?inline";

export default class StyleCustomization implements PoweruserModule {
    readonly id = 'StyleCustomization';
    readonly name = 'Stilisierung';
    readonly description = 'Einzelne Styleanpassungen';
    isTransparentNavbarEnabled = Settings.get(`${this.id}.settings.transparent_navbar`);
    hideBenis = Settings.get(`${this.id}.settings.hide_benis`, false);


    async load() {
        if (this.isTransparentNavbarEnabled === true) {
            document.getElementById("head")?.classList.add("transparent");
        }
        loadStyle(style);

        if(this.hideBenis === true) {
            const hideBenisStyle = document.createElement("style")
            hideBenisStyle.innerText = `
                .score, .user-score {
                    color: transparent;
                }
            `;

            document.head.appendChild(hideBenisStyle);
        }
    }

    getSettings(): ModuleSetting[] {
        return [
          {
            id: "transparent_navbar",
            title: "Transparente Navigationsleiste",
            description:
              'Die Navigationsleiste wird transparent angezeigt. Inspieriert von <a href="https://github.com/holzmaster/augenzuckerl">Augenzuckerl</a> von <a href="https://pr0gramm.com/user/holzmaster">@holzmaster</a>. Außerdem wird das Navigationsmenü auch im Widescreen Mode zentriert dargestellt.',
            type: "checkbox",
          },
          {
            id: "hide_benis",
            title: "Versteckt den Benis",
            description: 'Versteckt den Benis bei Posts, Kommenteren und Nutzern. Der Benis wird nur über unsichtbare Schrift versteckt und kann über eine Markierung sichtbar gemacht werden - wie Zaubertinte',
            type: "checkbox",
          },
        ];
    }
}