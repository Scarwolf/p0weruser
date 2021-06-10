export default class StatisticsLinkInNavbar {
    constructor() {
        this.id = 'StatisticsLinkInNavbar';
        this.name = 'Link to Statistics';
        this.description = '(Pr0mium) Verlinkt in der Navigation-Bar rechts oben auf die neue Statistik-Seite';
    }


    load() {
        this.addStatsLink();
    }

    addStatsLink() {
        this.target = document.getElementsByClassName('user-info user-only')[0];
        let elem = document.createElement("a");
        let text = document.createTextNode("Statistiken");
        elem.classList.add('head-link');
        elem.id = "user-link-stats";
        elem.appendChild(text);
        elem.setAttribute('href', 'https://pr0gramm.com/userstats');

        this.target.appendChild(elem);
    }
}