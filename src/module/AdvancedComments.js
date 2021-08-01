import Settings from '../Settings';

export default class AdvancedComments {
    constructor() {
        this.id = 'AdvancedComments';
        this.name = 'Erweiterte Kommentare';
        this.description = 'Erweitert die Kommentare um Farben und weitere Funktionen';
        this.displayColors = Settings.get('AdvancedComments.settings.display_colors');
    }

    /**
     * 
     * @param {string} pId 
     * @param {HTMLAnchorElement} source 
     */
    static handleMouseover(pId, source) {
        const elem = document.querySelectorAll(`#${pId} .comment-content`);
        source.title = elem[0].innerText;
    }


    load() {
        this.styles = require('../style/advancedComments.less');

        this.prepareComments();
    }

    /**
     * @returns {import("../P0weruser.js").P0weruserSetting[]}
     */
    getSettings() {
        return [
            {
                id: 'display_colors',
                title: 'Kommentarfarben',
                description: 'Färbe Kommentarebenen ein!'
            }
        ];
    }


    prepareComments() {
        window.addEventListener('commentsLoaded', () => {
            if (!this.displayColors) {
                $('.comments').addClass('no-colors');
            }

            const comments = $('.comments .comment-box .comment');
            comments.tooltip();
            comments.each(i => {
                const container = $(comments[i]);
                // Get predecessing comment if any
                const comment = $(container.parents('.comment-box')[0]).prev('.comment');

                // Get Authors Link
                const userHref = container.find('.comment-foot > a.user')[0].href;
                const isOwnComment = userHref.substr(userHref.lastIndexOf('/') + 1) === p.user.name;

                // If comment has a predecessor
                if (comment[0]) {
                    // Get ID of predecessor
                    const pId = comment[0].id;

                    // Add a new element which links to the predecessor
                    let elem = document.createElement('a');
                    elem.href = `#${pId}`;
                    elem.className = 'fa fa-level-up action preview-link';
                    container.find('.comment-foot').append(elem);

                    // Add Own comment class to point it out with style
                    if (isOwnComment) {
                        container[0].classList.add('own-comment');
                    }

                    // On mouseover show the comment in a tooltip
                    elem.addEventListener('mouseover', () => {
                        AdvancedComments.handleMouseover(pId, elem);
                    });
                }
            });
        });
    }
}
