import './benisInNavbar.less';
import { ModuleSetting, PoweruserModule, UserSyncEvent } from '@/types';
import Settings from '@/Settings';

export default class BenisInNavbar implements PoweruserModule {
    readonly id = 'BenisInNavbar';
    readonly name = 'Benis in Navigation';
    readonly description = 'Zeigt deinen aktuellen Benis in der Headerleiste an';

    readonly isLegacyIcon = Settings.get(`${this.id}.settings.lagcy_icon`) as boolean;
    readonly showUsername = Settings.get(`${this.id}.settings.show_username`) as boolean;

    target = document.getElementById('user-profile-name');
    benis = "-";


    load() {
        if(this.target === null) {
            throw new Error("Could not find target");
        }

        if (this.isLegacyIcon) {
            this.target.classList.add('legacy');
        }

        this.addListener();
        this.addBenis();
    }

    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'legacy_icon',
                title: 'cust0m Icon',
                description: 'Nutze das alte Icon vom cust0m-pr0gramm.',
                type: "checkbox"
            },
            {
                id: 'show_username',
                title: 'Benutzername neben der Benisanzeige',
                description: 'Zeigt neben der Benisanzeige deinen Nutzernamen an.',
                type: "checkbox"
            }
        ];
    }


    addBenis() {
        let showUsername = Settings.get('BenisInNavbar.settings.show_username');

        this.target!!.innerText = showUsername ? p.user.name + ' (' + this.benis + ')' : this.benis;
    }


    addListener() {
        window.addEventListener('userSync', (e: unknown) => {
            this.benis = String((e as UserSyncEvent).data.score);

            this.addBenis();
        });
    }
}
