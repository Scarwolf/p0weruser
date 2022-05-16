import { ModuleSetting, P, PoweruserModule } from '@/types';
import Settings from '@/core/Settings/Settings';

export default class AnonymousTitle implements PoweruserModule {
    readonly id = 'AnonymousTitle';
    readonly name = 'Anonymous Title';
    readonly description = 'Entfernt den Top Tag aus dem Titel oder wähle einen eigenen Titel.';
    readonly customTitle = Settings.get('AnonymousTitle.settings.custom_title');

    load() {
        this.addListeners();
    }

    addListeners() {
        p.mainView.setTitle = () => this.changeTitle();
        window.addEventListener('userSync', () => this.changeTitle());
    }


    changeTitle() {
        if (typeof this.customTitle === "string" && this.customTitle) {
            document.title = p.user.inboxCount > 0 ? '[' + p.user.inboxCount + '] ' + this.customTitle : this.customTitle;
        } else {
            document.title = `${p.user.inboxCount > 0 ? '[' + p.user.inboxCount + ']' : ''} pr0gramm.com – Die Datingplattform für Kellerkinder`;
        }
    }

    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'custom_title',
                title: 'cust0m Title',
                description: 'Wähle einen eigenen Title für die Seite.',
                type: 'text'
            }
        ];
    }
}
