import { PoweruserModule } from '@/types';
import SimpleBar from 'simplebar';
import './chat.less';

export default class Chat implements PoweruserModule {
    readonly id = 'Chat';
    readonly name = '[WIP] Chat';
    readonly description = 'Missbrauche die PMs als Chat.';

    load() {
        this.overrideView();
    }

    overrideView() {
        p.View.InboxMessages.Conversations = p.View.InboxMessages.Conversations.extend({
            show: function () {
                let pane = this.$container.parents('.pane');
                let top = pane.offset().top;
                pane.addClass('private-message-pane');
                pane.css('height', `calc(100vh - ${top}px)`);

                let cPane = pane.find('.conversations-pane');
                new SimpleBar(cPane[0]);

                this.parent();
            }
        });

        p.View.InboxMessages.Messages = p.View.InboxMessages.Messages.extend({
            show: function () {
                this.data.messages.reverse();
                this.parent();

                let iPane = this.$container.parents('.inbox-messages');
                let iScroll = new SimpleBar(iPane[0]);

                $(iScroll.getScrollElement()).scrollTop(iScroll.getScrollElement().scrollHeight);
            }
        });
    }
}
