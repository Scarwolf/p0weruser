import Settings from '../Settings';

export default class AnonymousTitle {
    constructor() {
        this.id = 'AnonymousTitle';
        this.name = 'Anonymous Title';
        this.description = 'Entfernt den Top Tag aus dem Titel oder wähle einen eigenen Titel.';
        this.customTitle = Settings.get('AnonymousTitle.settings.custom_title');
    }

    load() {
        this.addListeners();
    }

    addListeners() {
        p.mainView.setTitle = () => this.changeTitle();
    }

    changeTitle() {
        if (this.customTitle !== true && this.customTitle !== '') {
            document.title = p.user.inboxCount > 0 ? '[' + p.user.inboxCount + '] ' + this.customTitle : this.customTitle;
        } else {
            document.title = `${p.user.inboxCount > 0 ? '[' + p.user.inboxCount + ']' : ''} pr0gramm.com – Die Datingplattform für Kellerkinder`;
        }
    }

    getSettings() {
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
