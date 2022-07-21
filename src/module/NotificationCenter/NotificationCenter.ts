import Scrollbar from 'smooth-scrollbar';
//@ts-ignore
import template from '../../../assets/template/notificationCenter.html?raw'; // TODO
//@ts-ignore
import templateEntry from '../../../assets/template/notificationEntry.html?raw'; // TODO
import { ModuleSetting, PoweruserModule } from '@/types';
import Utils, { loadStyle } from '@/Utils';
// @ts-ignore
import style from './notificationCenter.less?inline';
import Settings, { scrollbarOptions } from '@/core/Settings/Settings';

export default class NotificationCenter implements PoweruserModule {
    readonly id = 'NotificationCenter';
    readonly name = 'Nachrichten Schnellzugriff';
    readonly description = 'Öffnet neue Benachrichtigungen in einem kleinen Menü';

    showUnreadMessages = Settings.get('NotificationCenter.settings.show_unread_messages');

    menuOpen = false;
    icon = $('#inbox-link');
    elem = document.createElement('div');
    messageContainer: HTMLUListElement | null = null;
    scrollbar: Scrollbar | null = null;

    static getTitle(message: any) {
        return message.thumb === null ? 'Private Nachricht' : 'Kommentar';
    }


    async load() {
        this.elem.innerHTML = template;
        this.elem.id = 'notification-center';
        document.querySelectorAll('.user-info.user-only')[0].appendChild(this.elem);
        this.messageContainer = document.getElementById('new-messages')! as HTMLUListElement;

        this.addListener();
        loadStyle(style);
    }

    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'show_unread_messages',
                title: 'Ungelesene Nachrichten Anzeigen',
                description: 'Zeigt auch ungelesene Nachrichten an, es werden allerdings nur gelesene hervorgehoben',
                type: "checkbox"
            }
        ];
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
        const container = this.messageContainer;
        if (!!this.scrollbar) {
            this.scrollbar.destroy();
        }

        if (!!container) {
            container.innerHTML = '<span class="fa fa-spinner fa-spin"></span>';
            container.classList.add('loading');

            this.getNotifications(true).then((notifications: any) => {
                let messages: any[] = notifications.messages;
                let unreadMessages = messages.filter(message => !message.read).length;

                container.innerHTML = '';
                container.classList.remove('loading');
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
                    container.appendChild(elem);
                    if (!this.showUnreadMessages) {
                        return false;
                    }
                }

                // Hiode deleted messages
                messages.filter(m => m.message !== null).forEach(element => {
                    this.addEntry(NotificationCenter.getTitle(
                        element),
                        element.name,
                        element.created,
                        element.thumb,
                        element.mark,
                        element.itemId,
                        element.id,
                        element.message,
                        element.read
                    );
                });
                this.scrollbar = Scrollbar.init(container, scrollbarOptions);
            });
        }
    }


    getNotifications(all = false) {
        return new Promise((resolve, reject) => {
            p.api.get(all ? 'inbox.all' : 'inbox.conversations', {}, resolve, reject);
        });
    }


    addEntry(title: any, user: any, date: any, image: any, mark: any, id: any, cId: any, msg: any, read: boolean) {
        let elem = document.createElement('li');
        elem.id = `notification-${cId}`;
        let img = '<img src="//thumb.pr0gramm.com/##THUMB##" class="comment-thumb">';
        let url = image ? `/new/${id}:comment${cId}` : `/inbox/messages/${user}`;

        if (!image) {
            img = '<span class="message fa fa-envelope-open"></span>';
        } else {
            img = img.replace('##THUMB', image);
        }

        if (user === null) {
            user = "Systembenachrichtigung";
        }

        elem.innerHTML = templateEntry.replaceArray(
            ['##TITLE##', '##USER##', '##TIME##', '##THUMB##', '##URL##', '##MARK##', '##TEXT##'],
            [title, user, new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date * 1000)), img, url, mark, Utils.escapeHtml(msg)]
        );

        $(elem).on("click", e => {
            e.preventDefault();
            const linkElem = $(e.target).closest("a").first();
            const href = linkElem.attr("href");
            if (href) {
                p.currentView = null;
                p.navigateTo(href.substring(1), p.NAVIGATE.FORCE);
            }
        });

        if (!read) {
            elem.classList.add("new");
        }
        this.messageContainer?.appendChild(elem);
    }
}
