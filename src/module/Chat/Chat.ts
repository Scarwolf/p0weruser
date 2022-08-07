import { PoweruserModule } from '@/types';
// @ts-ignore
import style from './chat.less?inline';
import { loadStyle } from '@/Utils';

export default class Chat implements PoweruserModule {
    readonly id = 'Chat';
    readonly name = '[WIP] Chat';
    readonly description = 'Missbrauche die PMs als Chat.';

    async load() {
        this.overrideView();
        // @ts-ignore
        loadStyle(style);
    }

    overrideView() {
        p.View.InboxMessages.Conversations = p.View.InboxMessages.Conversations.extend({
            show: function () {
                let pane = this.$container.parents('.pane');
                let top = pane.offset().top;
                pane.addClass('private-message-pane');
                pane.css('height', `calc(100vh - ${top}px)`);

                let cPane = pane.find('.conversations-pane').toArray();

                this.parent();
            }
        });

        p.View.InboxMessages.Messages = p.View.InboxMessages.Messages.extend({
            show: function () {
                this.data.messages.reverse();
                this.parent();

                let iPane = this.$container.parents('.inbox-messages');
                iPane.get(0).scrollTo(0, iPane.get(0).scrollHeight);
            }
        });
    }
}
