import SimpleBar from 'simplebar';
import Utils from '../Utils';

export default class Rep0st {
    constructor() {
        this.closeBtn = {};
        this.id = 'Rep0st';
        this.name = 'Rep0st Check';
        this.description = 'Frage rene8888, ob es sich um einen rep0st handelt.';
    }


    load() {
        let _this = this;
        this.visible = false;
        this.styles = require('../style/rep0st.less');

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex, itemData, defaultHeight, jumpToComment) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                _this.addButton(this.$container);
            },
            remove: function () {
                this.parent();

                _this.visible = false;
            }
        });

        Utils.addVideoConstants();
    }


    addButton(container) {
        const imgElement = container.find('.item-image-actual:not([src*=".gif"])');
        this.loader = $(`<span class="fa fa-spinner fa-spin loader"></span>`);

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


    checkImage(container, imgElement) {
        let dta = new FormData();
        let result = $('<div></div>');
        let bar = $('<div class="rep0sts"></div>');
        let template = $(`<div class="sidebar-head"><span class="fa fa-copy"></span><span class="sidebar-label">Reposts</span></div>`);
        let closeBtn = $(`<span class=" fa fa-close close"></span>`);
        template.append(closeBtn);
        bar.append(template);
        bar.append(this.loader);
        container.find('.image-main').after(bar);

        new SimpleBar(bar[0]); // NOSONAR

        closeBtn[0].addEventListener('click', () => {
            this.visible = false;
            bar.remove();
        });

        // Image Data
        dta.append('image', new Blob([], {type: 'application/octet-stream'}), '');
        dta.append('url', imgElement[0].src);


        // Filters
        let filters = p.user.flagsName.split('+');
        filters = filters.indexOf('all') !== -1 ? ['sfw', 'nsfw', 'nsfl'] : filters;

        for (const filter of filters) {
            dta.append('filter', filter);
        }

        GM_xmlhttpRequest({
            url: 'https://rep0st.rene8888.at/',
            method: 'POST',
            headers: {
                'cache-control': 'no-cache',
                'Upgrade-Insecure-Requests': 1,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            },
            overrideMimeType: 'multipart/form-data',
            data: dta,
            onload: (res) => {
                let output = [];
                this.visible = true;
                this.loader.remove();
                result.html($(res.responseText));
                const images = result.find('.search-results a');

                let currentPostId = this.getCurrentPostId();
                for (let i = 1; i < images.length; i++) {
                    let postId = parseInt(images[i].href.replace('pr0gramm', '').replace(/\D/g,''));

                    if(currentPostId !== postId) {
                        let childrenList = images[i].children[0];

                        let postUrl = images[i].href;
                        let probability = childrenList.children[0].innerHTML;
                        let imgSrc = childrenList.children[1].src;

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
            .replace(/\D/g,''));
    }


    displayImages(bar, urls) {
        bar = bar.find('.simplebar-content');

        urls.forEach(url => {
            let probabilityContainer = `<div class="probability">${url.probability}</div>`;

            let container = bar.append($(`<a href=${url.url} target="_blank"><img src=${url.img} class="rep0st-thumb" />${probabilityContainer}<span title="Als Repost markieren" class="fa fa-comment"></span></a>`));

            let commentContainer = container.find(`a[href='${url.url}'] > .fa.fa-comment`)[0];

            commentContainer.addEventListener('click', (e) => {
                e.preventDefault();
                let body = $(document.body);
                const comment = `Re: ${url.url}`;
                let commentField = body.find('.comment:not(.reply)');
                let tagsForm = body.find('.tag-form');

                commentField[0].value = comment;
                commentField.parent().find('input[type="submit"]')[0].click();
                tagsForm.find('.item-tagsinput')[0].value = 'repost';
                tagsForm.find('input[type="submit"]').click();
            });
        });
    }
}
