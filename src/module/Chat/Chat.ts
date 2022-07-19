import { PoweruserModule } from '@/types';
import Scrollbar from 'smooth-scrollbar';
// @ts-ignore
import style from './chat.less?inline';
import { loadStyle } from '@/Utils';
import { scrollbarOptions } from '@/core/Settings/Settings';

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
                Scrollbar.init(cPane[0], scrollbarOptions);

                this.parent();
            }
        });

        p.View.InboxMessages.Messages = p.View.InboxMessages.Messages.extend({
            show: function () {
                this.data.messages.reverse();
                this.parent();

                let iPane = this.$container.parents('.inbox-messages').toArray();

                const existingScrollbar = Scrollbar.get(iPane[0]);
                if (!!existingScrollbar) {
                    existingScrollbar.destroy();
                }
                const scrollbar = Scrollbar.init(iPane[0], scrollbarOptions);
                scrollbar.scrollTo(undefined, Number.MAX_VALUE);
            }
        });
    }
}
