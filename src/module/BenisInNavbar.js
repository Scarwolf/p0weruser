import Settings from '../Settings';
import Utils from '../Utils';

export default class BenisInNavbar {
    constructor() {
        this.id = 'BenisInNavbar';
        this.name = 'Benis in Navigation';
        this.description = 'Zeigt deinen aktuellen Benis in der Headerleiste an';
    }


    load() {
        this.benis = '-';
        this.styles = require('../style/benisInNavbar.less');
        this.target = document.getElementById('user-profile-name');

        if (Settings.get('BenisInNavbar.settings.legacy_icon')) {
            this.target.classList.add('legacy');
        }

        this.addListener();
        this.addBenis();
    }

    getSettings() {
        return [
            {
                id: 'legacy_icon',
                title: 'cust0m Icon',
                description: 'Nutze das alte Icon vom cust0m-pr0gramm.'
            }
        ];
    }


    addBenis() {
        this.target.innerText = this.benis;
    }


    addListener() {
        window.addEventListener('userSync', (e) => {
            this.benis = e.data.score;

            this.addBenis();
        });
    }
}
