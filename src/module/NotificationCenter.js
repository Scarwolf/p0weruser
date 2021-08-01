import SimpleBar from 'simplebar';
import Utils from '../Utils';

/**
 * @typedef {{
 *   type: "message" | "comment" | "notifcation",
 *   id: number,
 *   name: string,
 *   itemId?: number,
 *   image?: unknown,
 *   thumb?: string,
 *   created: number,
 *   mark: number,
 *   message: string
 * }} Message
 */

export default class NotificationCenter {
    constructor() {
        this.id = 'NotificationCenter';
        this.name = 'Nachrichten Schnellzugriff';
        this.description = 'Öffnet neue Benachrichtigungen in einem kleinen Menü';
    }

    /**
     * @param {{
     *   thumb: any
     * } | Message} message 
     * @returns {string}
     */
    static getTitle(message) {
        return message.thumb === null ? 'Private Nachricht' : 'Kommentar';
    }


    load() {
        this.menuOpen = false;
        this.template = require('../template/notificationCenter.html');
        this.templateEntry = require('../template/notificationEntry.html');
        this.style = require('../style/notificationCenter.less');
        this.icon = $('#inbox-link');
        this.elem = document.createElement('div');
        this.elem.innerHTML = this.template;

        this.elem.id = 'notification-center';
        document.querySelectorAll('.user-info.user-only')[0].appendChild(this.elem);
        this.messageContainer = document.getElementById('new-messages');

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
                if (!$(e.target).parents('#notification-center')[0]) {
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

        this.getNotifications(true).then((notifications) => {
            /** @type {Message[]} */
            const messages = notifications.messages;
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

            if (unreadMessages.length <= 0) {
                let elem = document.createElement('li');
                elem.innerText = 'Keine neuen Benachrichtigungen!';
                elem.className = 'no-notifications';
                this.messageContainer.appendChild(elem);
                return false;
            }

            messages.forEach(message => {
                this.addEntry(NotificationCenter.getTitle(
                    message),
                    message.name,
                    message.created,
                    message.thumb,
                    message.mark,
                    message.itemId,
                    message.id,
                    message.message
                );
            });
            new SimpleBar(this.messageContainer); // NOSONAR

            this.getNotifications(false).then((notifications2) => {
                let messages2 = notifications2.messages;

                if (messages2 && messages2.length <= 0) {
                    return false;
                }

                messages2.forEach(message => {
                    let element = $(this.messageContainer).find(`#notification-${message.id}`)[0];
                    if(element !== undefined)
                        element.classList.add('new');
                });
            });
        });
    }

    /**
     * @param {boolean} all 
     * @returns {Promise<unknown>}
     */
    getNotifications(all = false) {
        return new Promise((resolve, reject) => {
            p.api.get(all ? 'inbox.all' : 'inbox.conversations', {}, resolve, reject);
        });
    }


    /**
     * 
     * @param {string} title 
     * @param {string} user 
     * @param {number} date 
     * @param {unknown?} image 
     * @param {number} mark 
     * @param {number?} id 
     * @param {number} cId 
     * @param {string} msg 
     */
    addEntry(title, user, date, image, mark, id, cId, msg) {
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

        elem.innerHTML = this.templateEntry.replaceArray(
            ['##TITLE##', '##USER##', '##TIME##', '##THUMB##', '##URL##', '##MARK##', '##TEXT##'],
            [title, user, new Date(date * 1000).relativeTime(), img, url, mark, Utils.escapeHtml(msg)]
        );

        this.messageContainer.appendChild(elem);
    }
}
