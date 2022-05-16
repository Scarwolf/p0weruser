import Settings from "../Settings";
import style from "../../assets/style/styleCustomization.less?raw"; // TODO

export default class StyleCustomization {
    id = 'StyleCustomization';
    name = 'Stilisierung';
    description = 'Einzelne Style-Anpassungen am pr0, die nicht so richtig in ein Modul gehören.';
    transparentNavbar = Settings.get(`${this.id}.settings.transparent_navbar`);
    styles = style;


    load() {
        if(this.transparentNavbar === true) {
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
