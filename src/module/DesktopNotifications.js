// Inspired by komas pr0gramm Desktop-Notification
// https://greasyfork.org/de/scripts/9984-pr0gramm-desktop-notification/code
export default class DesktopNotifications {
    constructor() {
        this.id = 'DesktopNotifications';
        this.name = 'Desktop Notifications';
        this.description = 'Informiert bei neuen Nachrichten';
        this.notifications = 0;
    }


    load() {
        window.addEventListener('userSync', (e) => {
            if (e.data.inbox.messages > this.notifications) {
                GM_notification(
                    'Du hast ' + (e.data.inbox.messages === 1 ? 'eine ungelesene Nachricht!' : e.data.inbox.messages + ' ungelesene Nachrichten!'),
                    'pr0gramm',
                    'http://pr0gramm.com/media/pr0gramm-favicon.png',
                    function () {
                        window.focus();
                        window.location.href = '/inbox/messages';
                    }
                );
            }

            this.notifications = e.data.inbox.messages;
        })
    }
}
