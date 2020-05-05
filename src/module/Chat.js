import SimpleBar from 'simplebar';

export default class Chat {
    constructor() {
        this.id = 'Chat';
        this.name = '[WIP] Chat';
        this.description = 'Missbrauche die PMs als Chat.';
    }

    load() {
        this.styles = require('../style/chat.less');

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
                let cScroll = new SimpleBar(cPane[0]);

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
