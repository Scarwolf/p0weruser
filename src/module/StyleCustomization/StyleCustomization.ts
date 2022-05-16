import Settings from "@/Settings";
import "./styleCustomization.css";

export default class StyleCustomization {
    id = 'StyleCustomization';
    name = 'Stilisierung';
    description = '';
    isTransparentNavbarEnabled = Settings.get(`${this.id}.settings.transparent_navbar`);


    load() {
        if(this.isTransparentNavbarEnabled === true) {
            document.getElementById("head")?.classList.add("transparent");
        }
    }

    getSettings() {
        return [
            {
                id: 'transparent_navbar',
                title: 'Transparente Navigationsleiste',
                description: 'Die Navigationsleiste wird transparent angezeigt. Inspieriert von <a href="https://github.com/holzmaster/augenzuckerl">Augenzuckerl</a> von <a href="https://pr0gramm.com/user/holzmaster">@holzmaster</a>'
            }
        ];
    }
}