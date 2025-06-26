import { ModuleSetting, PoweruserModule, UserSyncEvent } from '@/types';
import Settings from "@/core/Settings/Settings";
import style from './benisInNavbar.less?inline';
import { loadStyle } from '@/Utils';

export default class BenisInNavbar implements PoweruserModule {
    readonly id = 'BenisInNavbar';
    readonly name = 'Benis in Navigation';
    readonly description = 'Zeigt deinen aktuellen Benis in der Headerleiste an';

    readonly isLegacyIcon = Settings.get(`${this.id}.settings.lagcy_icon`) as boolean;
    readonly showUsername = Settings.get(`${this.id}.settings.show_username`) as boolean;

    target = document.getElementById('user-profile-name');
    benis = "-";


    async load() {
        if(this.target === null) {
            throw new Error("Could not find target");
        }

        if (this.isLegacyIcon) {
            this.target.classList.add('legacy');
        }

        this.addListener();
        this.addBenis();
        loadStyle(style);
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
        window.addEventListener('userSync', async (e: unknown) => {
          const benisPlaceholder = "-";
          const benisFromEvent = (e as UserSyncEvent).data.score;
          const fetchBenisFromApi = async () => {
            const response = await fetch("/api/user/score", {
              credentials: "same-origin",
              headers: {
                Accept: "application/json",
              },
            });
            const api_result = await response.json();
            if ("score" in api_result) {
              return api_result.score;
            } else {
              throw new Error("score not found in api result");
            }
          }

          this.benis = String(
            benisFromEvent ||
            await fetchBenisFromApi()
              .catch((error) => {
                console.error(error);
                return benisPlaceholder;
              })
          ) || benisPlaceholder;


            this.addBenis();
        });
    }
}
