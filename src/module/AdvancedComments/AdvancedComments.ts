import Settings from '@/core/Settings/Settings';
import { ModuleSetting, P, PoweruserModule } from '@/types';

export default class AdvancedComments implements PoweruserModule {
    readonly id = 'AdvancedComments';
    readonly name = 'Erweiterte Kommentare';
    readonly description = 'Erweitert die Kommentare um Farben und weitere Funktionen';
    readonly isDisplayColorsEnabled = Settings.get('AdvancedComments.settings.display_colors');


    static handleMouseover(pId: string, source: HTMLElement) {
        const elem = $(`#${pId} .comment-content`);
        source.title = elem[0].innerText;
    }


    async load() {
        this.prepareComments();
        // TODO: Let typescript know about less files.
        // @ts-ignore
        await import('./advancedComments.less');
    }


    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'display_colors',
                title: 'Kommentarfarben',
                description: 'Färbe Kommentarebenen ein!',
                type: "checkbox"
            }
        ];
    }


    prepareComments() {
        window.addEventListener('commentsLoaded', () => {
            if (!this.isDisplayColorsEnabled) {
                $('.comments').addClass('no-colors');
            }

            const comments = $('.comments .comment-box .comment');
            for (const element of comments) {
                const container = $(element);
                const comment = $(container.parents('.comment-box')[0]).prev('.comment');
                const userHref = (container.find('.comment-foot > a.user')[0] as HTMLAnchorElement).href;
                const isOwnComment = userHref.substr(userHref.lastIndexOf('/') + 1) === p.user.name;

                if (comment[0]) {
                    const pId = comment[0].id;
                    let elem = document.createElement('a');
                    elem.href = `#${pId}`;
                    elem.className = 'fa fa-level-up action preview-link';
                    container.find('.comment-foot').append(elem);

                    if (isOwnComment) {
                        container[0].classList.add('own-comment');
                    }

                    elem.addEventListener('mouseover', () => {
                        AdvancedComments.handleMouseover(pId, elem);
                    });
                }
            }
        });
    }
}
