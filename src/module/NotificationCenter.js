import SimpleBar from 'simplebar';
import Utils from '../Utils';

/**
 * @typedef {{
 *   blocked: number,
 *   collection?: unknown,
 *   flags: number,
 *   id: number,
 *   image?: unknown,
 *   itemId?: number,
 *   keyword?: unknown,
 *   mark: number,
 *   message: string
 *   name: string, 
 *   owner?: unknown,
 *   ownerMark?: unknwon
 *   read: number,
 *   score: number,
 *   senderId: number,
 *   thumb?: string
 *   type: "message" | "comment" | "notifcation"
 * }} Message
 */

/**
 * @typedef {{
 *   mark: number,
 *   name: string,
 *   lastMessage: number,
 *   unreadCount: number,
 *   blocked: number
 * }} Conversation
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
        this.icon.off('click');
        // Click on icon -> opens Menu
        this.icon[0].addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        // Click elsewhere -> closes Menu
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

        // Set Loading indicator
        this.messageContainer.innerHTML = '<span class="fa fa-spinner fa-spin"></span>';
        this.messageContainer.classList.add('loading');

        // Get dem notifications
        this.getInbox().then((notifications) => {
            /** @type {Message[]} */
            const messages = notifications.messages;
            let unreadMessages = messages.filter(message => !message.read);

            this.messageContainer.innerHTML = '';
            
            // Rmove da loading
            this.messageContainer.classList.remove('loading');
            
            p.user.setInboxLink({
                notifications: 0,
                mentions: 0,
                messages: 0,
                comments: 0,
                follows: 0
            });

            // If no unread messages are present
            if (unreadMessages.length <= 0) {
                let elem = document.createElement('li');
                elem.innerText = 'Keine neuen Benachrichtigungen!';
                elem.className = 'no-notifications';
                this.messageContainer.appendChild(elem);
                return false;
            }

            // Add messages to notification center
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

            this.getConversations().then((conversation) => {
                let conversations = conversation.conversations;

                if (conversations && conversations.length <= 0) {
                    return false;
                }
                /* TODO: No ID is present on conversations, what shall we do?
                conversations.forEach(conv => {
                    let element = $(this.messageContainer).find(`#notification-${conv.id}`)[0];
                    if(element !== undefined)
                        element.classList.add('new');
                }); */
            });
        });
    }

    /**
     * @returns {Promise<{
     *   messages: Message[]
     * }>}
     */
    getInbox() {
        return new Promise((resolve, reject) => p.api.get('inbox.all', {}, resolve, reject));
    }

    /**
     * 
     * @returns {Promise<{
     *   conversations: Conversation[]
     * }>}
     */
    getConversations() {
        return new Promise((resolve, reject) => p.api.get('inbox.conversations', {}, resolve, reject));
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
