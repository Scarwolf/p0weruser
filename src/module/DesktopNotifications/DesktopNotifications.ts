// Inspired by komas pr0gramm Desktop-Notification

import { PoweruserModule, UserSyncEvent } from "@/types";

// https://greasyfork.org/de/scripts/9984-pr0gramm-desktop-notification/code
export default class DesktopNotifications implements PoweruserModule {
    readonly id = 'DesktopNotifications';
    readonly name = 'Desktop Notifications';
    readonly description = 'Informiert bei neuen Nachrichten';
    notifications = 0;


    async load() {
        window.addEventListener('userSync', (e) => {
            const event = e as unknown as UserSyncEvent;
            if (event.data.inbox.messages > this.notifications) {
                GM.notification(
                    'Du hast ' + (event.data.inbox.messages === 1 ? 'eine ungelesene Nachricht!' : event.data.inbox.messages + ' ungelesene Nachrichten!'),
                    'pr0gramm',
                    'http://pr0gramm.com/media/pr0gramm-favicon.png',
                    function () {
                        window.focus();
                        window.location.href = '/inbox/messages';
                    }
                );
            }

            this.notifications = event.data.inbox.messages;
        })
    }
}
