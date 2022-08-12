import { PoweruserModule } from '@/types';
import Utils, { loadStyle } from '@/Utils';
// @ts-ignore
import style from './rep0st.less?inline';


export default class Rep0st implements PoweruserModule {
    closeBtn = {};
    readonly id = 'Rep0st';
    readonly name = 'Rep0st Check';
    readonly description = 'Frage rene8888, ob es sich um einen rep0st handelt.';
    visible = false;
    $loader?: JQuery<HTMLElement>;

    async load() {
        let _this = this;

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex: any, itemData: any, defaultHeight: any, jumpToComment: any) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                _this.addButton(this.$container);
            },
            remove: function () {
                this.parent();

                _this.visible = false;
            }
        });

        Utils.addVideoConstants();
        loadStyle(style);
    }


    addButton(container: any) {
        const imgElement = container.find('.item-image-actual:not([src*=".gif"])');
        this.$loader = $(`<span class="fa fa-spinner fa-spin loader"></span>`);

        if (imgElement[0] && imgElement[0].tagName !== 'VIDEO') {
            const template = $(`<a title="Prüfe, ob es sich um einen Repost handelt" class="repost-link"><span class="fa fa-copy"></span> rep0st?</a>`);
            let sourceElement = container.find('.item-details .user');
            sourceElement.after(template);

            template[0].addEventListener('click', () => {
                if (!this.visible) {
                    this.checkImage(container, imgElement);
                }
            });
        }
    }


    checkImage(container: any, imgElement: any) {
        let dta = new FormData();
        let result = $('<div></div>');
        let bar = $('<div class="rep0sts"></div>');
        let template = $(`<div class="sidebar-head"><span class="fa fa-copy"></span><span class="sidebar-label">Reposts</span></div>`);
        let closeBtn = $(`<span class=" fa fa-close close"></span>`);
        template.append(closeBtn);
        bar.append(template);
        bar.append(this.$loader!);
        container.find('.image-main').after(bar);

        closeBtn[0].addEventListener('click', () => {
            this.visible = false;
            bar.remove();
        });

        // Image Data
        dta.append('image', new Blob([], { type: 'application/octet-stream' }), '');
        dta.append('url', imgElement[0].src);


        // Filters
        let filters = p.user.flagsName.split('+');
        filters = filters.indexOf('all') !== -1 ? ['sfw', 'nsfw', 'nsfl'] : filters;

        for (const filter of filters) {
            dta.append('filter', filter);
        }

        GM.xmlHttpRequest({
            url: 'https://rep0st.rene8888.at/',
            method: 'POST',
            headers: {
                'cache-control': 'no-cache',
                'Upgrade-Insecure-Requests': '1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            },
            overrideMimeType: 'multipart/form-data',
            // @ts-ignore
            data: dta,
            onload: (res) => {
                let output = [];
                this.visible = true;
                this.$loader!.remove();
                result.html(res.responseText);
                const images = result.find('.search-results a') as JQuery<HTMLAnchorElement>;

                let currentPostId = this.getCurrentPostId();
                for (let i = 1; i < images.length; i++) {
                    let postId = parseInt(images[i].href.replace('pr0gramm', '').replace(/\D/g, ''));

                    if (currentPostId !== postId) {
                        let childrenList = images[i].children[0];

                        let postUrl = images[i].href;
                        let probability = childrenList.children[0].innerHTML;
                        let imgSrc = (childrenList.children[1] as HTMLImageElement).src;

                        output.push({
                            url: postUrl,
                            img: imgSrc,
                            probability: probability,
                        });
                    }
                }

                this.displayImages(bar, output);
            }
        });
    }

    getCurrentPostId() {
        return parseInt(window.location.href
            .replace('pr0gramm', '')
            .replace(/\D/g, ''));
    }


    displayImages(bar: any, urls: any) {
        for (const element of urls) {
            let probabilityContainer = `<div class="probability">${element.probability}</div>`;

            let container = bar.append($(`<a href=${element.url} target="_blank"><img src=${element.img} class="rep0st-thumb" />${probabilityContainer}<span title="Als Repost markieren" class="fa fa-comment"></span></a>`));

            let comment = container.find(`a[href='${element.url}'] > .fa.fa-comment`)[0];

            comment.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                let body = $(document.body);
                const comment = `Re: ${element.url}`;
                let commentField = body.find('.comment:not(.reply)');
                let tagsForm = body.find('.tag-form');

                (commentField[0] as any).value = comment;
                commentField.parent().find('input[type="submit"]')[0].click();
                (tagsForm.find('.item-tagsinput')[0] as any).value = 'repost';
                tagsForm.find('input[type="submit"]').click();
            });
        }
    }
}
