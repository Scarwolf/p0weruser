import Settings from '../Settings';

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

    /**
     * @returns {import("../P0weruser.js").P0weruserSetting[]}
     */
    getSettings() {
        return [
            {
                id: 'legacy_icon',
                title: 'cust0m Icon',
                description: 'Nutze das alte Icon vom cust0m-pr0gramm.'
            },
            {
                id: 'show_username',
                title: 'Benutzername neben der Benisanzeige',
                description: 'Zeigt neben der Benisanzeige deinen Nutzernamen an.'
            }
        ];
    }


    addBenis() {
        let showUsername = Settings.get('BenisInNavbar.settings.show_username');

        this.target.innerText = showUsername ? p.user.name + ' (' + this.benis + ')' : this.benis;
    }


    addListener() {
        // If the benis is updated due to a sync
        window.addEventListener('userSync', (e) => {
            this.benis = e.data.score;

            this.addBenis();
        });
    }
}
