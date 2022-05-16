import SimpleBar from 'simplebar';
import Utils from '../../Utils';
//@ts-ignore
import template from '../../../assets/template/notificationCenter.html?raw'; // TODO
//@ts-ignore
import templateEntry from '../../../assets/template/notificationEntry.html?raw'; // TODO
import './notificationCenter.less';

export default class NotificationCenter {
    readonly id = 'NotificationCenter';
    readonly name = 'Nachrichten Schnellzugriff';
    readonly description = 'Öffnet neue Benachrichtigungen in einem kleinen Menü';

    menuOpen = false;
    icon = $('#inbox-link');
    elem = document.createElement('div');
    messageContainer = document.getElementById('new-messages')!;

    static getTitle(message: any) {
        return message.thumb === null ? 'Private Nachricht' : 'Kommentar';
    }


    load() {
        this.elem.innerHTML = template;
        this.elem.id = 'notification-center';
        document.querySelectorAll('.user-info.user-only')[0].appendChild(this.elem);

        this.addListener();
    }


    addListener() {
        this.icon.unbind('click');
        this.icon[0].addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        window.addEventListener('click', (e) => {
            if (this.menuOpen) {
                if (!$(e.target!).parents('#notification-center')[0]) {
                    e.preventDefault();
                    this.toggleMenu();
                }
            }
        });
    }


    toggleMenu() {
        this.menuOpen = !this.menuOpen;
        this.icon[0].classList.toggle('active');
        this.elem.classList.toggle('visible');
        this.messageContainer.innerHTML = '<span class="fa fa-spinner fa-spin"></span>';
        this.messageContainer.classList.add('loading');

        this.getNotifications(true).then((notifications: any) => {
            let messages: any[] = notifications.messages;
            let unreadMessages = messages.filter(message => !message.read).length;

            this.messageContainer.innerHTML = '';
            this.messageContainer.classList.remove('loading');
            p.user.setInboxLink({
                notifications: 0,
                mentions: 0,
                messages: 0,
                comments: 0,
                follows: 0
            });

            if (unreadMessages <= 0) {
                let elem = document.createElement('li');
                elem.innerText = 'Keine neuen Benachrichtigungen!';
                elem.className = 'no-notifications';
                this.messageContainer.appendChild(elem);
                return false;
            }

            for (const element of messages) {
                this.addEntry(NotificationCenter.getTitle(
                    element),
                    element.name,
                    element.created,
                    element.thumb,
                    element.mark,
                    element.itemId,
                    element.id,
                    element.message
                );
            }
            new SimpleBar(this.messageContainer);

            this.getNotifications(false).then((notifications: any) => {
                const msgs = notifications.messages;

                if (msgs.length <= 0) {
                    return false;
                }

                for (const msg of msgs) {
                    let element = $(this.messageContainer).find(`#notification-${msg.id}`)[0];
                    if(element !== undefined)
                        element.classList.add('new');
                }
            });
        });
    }


    getNotifications(all = false) {
        return new Promise((resolve, reject) => {
            p.api.get(all ? 'inbox.all' : 'inbox.conversations', {}, resolve, reject);
        });
    }


    addEntry(title: any, user: any, date: any, image: any, mark: any, id: any, cId: any, msg: any) {
        let elem = document.createElement('li');
        elem.id = `notification-${cId}`;
        let img = '<img src="//thumb.pr0gramm.com/##THUMB##" class="comment-thumb">';
        let url = image ? `/new/${id}:comment${cId}` : `/inbox/messages/${user}`;

        if (!image) {
            img = '<span class="message fa fa-envelope-open"></span>';
        } else {
            img = img.replace('##THUMB', image);
        }

        if(user === null) {
            user = "Systembenachrichtigung";
        }

        elem.innerHTML = templateEntry.replaceArray(
            ['##TITLE##', '##USER##', '##TIME##', '##THUMB##', '##URL##', '##MARK##', '##TEXT##'],
            [title, user, new Date(date * 1000), img, url, mark, Utils.escapeHtml(msg)]
        );

        this.messageContainer.appendChild(elem);
    }
}
