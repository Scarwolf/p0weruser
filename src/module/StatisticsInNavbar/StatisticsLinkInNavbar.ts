import { PoweruserModule } from "@/types";

export default class StatisticsLinkInNavbar implements PoweruserModule{
    readonly id = 'StatisticsLinkInNavbar';
    readonly name = 'Link to Statistics';
    readonly description = '(Pr0mium) Verlinkt in der Navigation-Bar rechts oben auf die neue Statistik-Seite';
    target = document.getElementsByClassName('user-info user-only')[0];


    load() {
        this.addStatsLink();
    }

    addStatsLink() {
        let elem = document.createElement("a");
        let text = document.createTextNode("Statistiken");
        elem.classList.add('head-link');
        elem.id = "user-link-stats";
        elem.appendChild(text);
        elem.setAttribute('href', 'https://pr0gramm.com/userstats');

        this.target.appendChild(elem);
    }
}