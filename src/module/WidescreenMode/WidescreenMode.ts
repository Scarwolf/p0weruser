import Scrollbar from 'smooth-scrollbar';
import Settings from '@/core/Settings/Settings';
import Utils, { loadStyle } from '@/Utils';
// @ts-ignore
import style from './widescreenMode.less?inline';

// @ts-ignore
import streamItemTemplate from "../../../assets/template/streamItem.html?raw"; // TODO
// @ts-ignore
import streamItemCommentsTemplate from "../../../assets/template/streamItemComments.html?raw"; // TODO
import { ModuleSetting, PoweruserModule } from '@/types';

export default class WidescreenMode implements PoweruserModule {
    readonly id = 'WidescreenMode';
    readonly name = 'Widescreen Mode';
    container: any = {};
    commentsContainer: any = {};
    resized: boolean = false;
    listenerAdded = false;
    readonly description = 'Stellt das pr0 im Breitbildmodus dar.';
    readonly displayBenis = Settings.get('WidescreenMode.settings.display_benis');
    readonly closeOnBackgroundClick = Settings.get('WidescreenMode.settings.close_on_background');
    readonly mouseControl = Settings.get('WidescreenMode.settings.mouse_control');
    readonly displayBenisbar = Settings.get('WidescreenMode.settings.display_benisbar');
    readonly scrollMultiplicator = Number(Settings.get('WidescreenMode.settings.scroll_speed') as string) || 1;
    readonly displayBenisUntilTop = Settings.get("WidescreenMode.settings.display_benis_until_top");
    readonly biggerStreamNavIcons = Settings.get("WidescreenMode.settings.bigger_stream_nav_icons");
    readonly commentsLeft = Settings.get("WidescreenMode.settings.comments_left");
    readonly logoLinksToNew = Settings.get('WidescreenMode.settings.logo_links_to_new');

    commentsWide = window.localStorage.getItem('comments_wide') === 'true';
    commentsClosed = window.localStorage.getItem('comments_closed') === 'true';
    comments: any[] = [];
    header = document.getElementById('head-content');
    nav: { button: any, links: any, container: any } = {
        button: null,
        links: null,
        container: document.getElementById('footer-links')
    };
    logoLink?: HTMLAnchorElement;
    moveLink = document.getElementsByClassName('move-link')[0]!;
    img?: any;
    isMoveable: boolean = false;



    handleWheelChange(e: WheelEvent) {
        if (this.isMoveable) {
            this.img.animate({
                top: (e.deltaY > 0 ? '-=' : '+=') + (20 * this.scrollMultiplicator)
            }, 0);

            return false;
        }

        if (this.hasUnsentComments()) {
            let state = window.confirm('Du hast noch nicht abgeschickte Kommentare! Willst du dieses Medium wirklich verlassen?');

            if (!state) {
                return false;
            }
        }

        const el: HTMLElement = e.deltaY < 0 ? (document.getElementsByClassName('stream-prev')[0] as HTMLElement) : (document.getElementsByClassName('stream-next')[0] as HTMLElement);

        el.click();
    }


    async load() {
        this.checkScoreDisplay();
        this.addInputListeners();
        this.addHeaderListener();
        this.overrideViews();
        this.addNavigation();

        if (this.logoLinksToNew) {
            this.modifyLogo();
        }
        loadStyle(style);
    }

    checkScoreDisplay() {
        if (this.displayBenis) {
            p.shouldShowScore = () => {
                return true;
            };
        }
    }


    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'display_benis_until_top',
                title: 'Benis bis beliebt anzeigen',
                description: 'Zeigt an, wie viel Benis ungefähr bis beliebt fehlt. (Nur mit Benisleiste möglich)',
                type: "checkbox"
            },
            {
                id: 'display_benis',
                title: 'Benis sofort anzeigen',
                description: 'Zeigt den Benis direkt ohne Wartezeit an!',
                type: "checkbox"
            },
            {
                id: 'mouse_control',
                title: 'Steuerung mit der Maus',
                description: 'Wechsle mit dem Mausrad zwischen Medien.',
                type: "checkbox"
            },
            {
                id: 'close_on_background',
                title: 'Hintergrund schließt',
                description: 'Bei Klick auf Hintergrund Medium schließen.',
                type: "checkbox"
            },
            {
                id: 'display_benisbar',
                title: 'Benisleiste anzeigen',
                description: 'Zeigt die Benisverteilung als Leiste an.',
                type: "checkbox"
            },
            {
                id: 'bigger_stream_nav_icons',
                title: 'Post-Navigationslinks vergrößern',
                description: 'Vergrößert die Links um zum nächsten/vorherigen Post zu kommen. (Nur ohne pr0mium)',
                type: "checkbox"
            },
            {
                id: 'scroll_speed',
                title: 'Scrollgeschwindigkeit',
                description: 'Definiere, wie schnell im Zoom gescrollt werden soll.',
                type: 'number'
            },
            {
                id: 'comments_left',
                title: 'Kommentare auf der linken Seite',
                description: 'Wenn deaktiviert werden Kommentare auf der rechten Seite des Bildschirms angezeigt.',
                type: "checkbox"
            },
            {
                id: 'logo_links_to_new',
                title: 'Logo-Verlinkung auf Neu',
                description: 'Wenn aktiviert bringt dich ein Klick auf das pr0gramm Logo nach /new statt /top.',
                type: "checkbox"
            },
        ];
    }


    addHeaderListener() {
        const headerLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('#head-menu > a');
        for (const element of headerLinks) {
            $(element).unbind('click');
            element.addEventListener('click', e => {
                e.preventDefault();

                const hrefAttr = element.getAttribute("href");
                if (hrefAttr == null) {
                    throw new Error("Could not parse navigation link from anchor element. There is no href attribute");
                }
                const href = hrefAttr.startsWith("/") ? hrefAttr.slice(1) : hrefAttr;

                if (href === p.location) {
                    p.reload();
                } else {
                    p.navigateTo(href);
                }
            });
        }
    }


    addInputListeners() {
        if (!this.listenerAdded) {
            this.listenerAdded = true;
            document.addEventListener('keydown', (e) => {
                this.handleKeypress(e,
                    document.activeElement!.tagName === 'TEXTAREA' ||
                    document.activeElement!.tagName === 'INPUT'
                );
            });

            window.addEventListener('locationChange', (e: any) => {
                if (e.mode === 0 || !e.isPost) {
                    document.body.classList.remove('fixed');
                }
            })
        }
    }


    modifyLogo() {
        const originalLink: HTMLAnchorElement = document.getElementById('pr0gramm-logo-link')! as HTMLAnchorElement;

        this.logoLink = originalLink.cloneNode(true) as HTMLAnchorElement;
        originalLink.parentNode!.replaceChild(this.logoLink, originalLink);
        this.logoLink.href = '/new';

        this.logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (p.location === 'new') {
                p.reload();
            } else {
                p.navigateTo('new', p.NAVIGATE.DEFAULT);
            }
        });
    }


    overrideViews() {
        // Override Item-View
        let _this = this;

        p.View.Stream.Item = p.View.Stream.Item.extend({
            template: streamItemTemplate,
            show: function (rowIndex: number, itemData: any, defaultHeight: any, jumpToComment: any, cacheBust: any) {
                itemData.trimmedUrl = itemData.image.replace(/^\/\//g, "")
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment, cacheBust);
                this.syncVotes(p.user.voteCache.votes);

                const benisbar: HTMLElement = document.getElementsByClassName('benisbar')[0] as HTMLElement;
                if (_this.displayBenisbar) {
                    if (itemData.down > 0) {
                        let percentage = itemData.up / (itemData.up + itemData.down);
                        benisbar.setAttribute('style', `background-image: -webkit-gradient(linear, 0% 0%, 100% 0%, from(#5cb85c), to(#888),` +
                            ` color-stop(${percentage}, #5cb85c), color-stop(${percentage}, #888));`);
                    }

                    if (_this.displayBenisUntilTop) {
                        const now = Date.now();
                        if (Math.abs(now - itemData.date) / 36e5 < 3 && itemData.promoted == 0) {
                            benisbar.dataset.afterText += " (" + _this.calculateBenisUntilTop(itemData.up, itemData.down, itemData.date) + " bis beliebt)";
                        }
                    }

                    benisbar.classList.add('show', String(_this.displayBenisbar));
                }

                _this.addItemListener(this.$image, itemData);
                document.body.classList.add('fixed');

                if (_this.biggerStreamNavIcons) {
                    let prev = document.getElementsByClassName('stream-prev-icon')[0];
                    let next = document.getElementsByClassName('stream-next-icon')[0];

                    if (prev !== undefined)
                        prev.classList.add('stream-prev-icon-xl');

                    if (next !== undefined)
                        next.classList.add('stream-next-icon-xl');
                }

                if (!_this.commentsLeft) {
                    document.getElementsByClassName('item-container-content')[0].classList.add('right');
                }
            },
            remove: function () {
                this.parent();
                document.body.classList.remove('fixed');
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();

        // Extend comments-rendering and template
        p.View.Stream.Comments = p.View.Stream.Comments.extend({
            template: streamItemCommentsTemplate,
            render: function () {
                this.parent();
                _this.comments = [this.$commentForm.find('textarea')[0]];
                _this.commentsContainer = this.$container;
                _this.commentsContainer[0].classList.toggle('wide', _this.commentsWide);
                _this.commentsContainer[0].classList.toggle('closed', _this.commentsClosed);
                _this.commentsContainer[0].classList.add('loaded');

                const existingScrollbar = Scrollbar.get(this.$container[0]);
                if (!!existingScrollbar) {
                    existingScrollbar.destroy();
                }
                Scrollbar.init(this.$container[0], {});

                let commentSwitch = this.$container.find('.comments-switch')[0];
                let commentsClose = this.$container.find('.comments-toggle')[0];
                commentSwitch.addEventListener('click', () => {
                    this.$container[0].classList.toggle('wide');
                    _this.commentsWide = this.$container[0].classList.contains('wide');

                    window.localStorage.setItem('comments_wide', String(_this.commentsWide));
                });

                commentsClose.addEventListener('click', () => {
                    this.$container[0].classList.toggle('closed');
                    _this.commentsClosed = this.$container[0].classList.contains('closed');

                    window.localStorage.setItem('comments_closed', String(_this.commentsClosed));
                })
            },
            focusComment(comment: any) {
                let target = this.$container.find('#' + comment);
                if (target.length) {
                    Utils.waitForElement('.scroll-content').then((el) => {
                        this.$scrollContainer = $(el[0]);
                        let jumpPos = target.offset().top - this.$scrollContainer.offset().top - CONFIG.HEADER_HEIGHT - 80;
                        this.$scrollContainer.scrollTop(jumpPos);
                        target.highlight(180, 180, 180, 1);
                    });
                }
            },
            showReplyForm(ev: any) {
                this.parent(ev);
                let id = ev.currentTarget.href.split(':comment')[1];
                _this.comments.push(document.querySelectorAll(`#comment${id} textarea`)[0]);
            }
        });

        p.View.Stream.Comments.SortConfidenceTime = (itemUser: any) => function (a: any, b: any) {
            if (a.confidence >= 0.2 && itemUser === a.name && itemUser !== b.name) {
                return -1;
            } else if (b.confidence >= 0.2 && itemUser === b.name && itemUser !== a.name) {
                return 1;
            }
            return (b.confidence === a.confidence ? a.created - b.created : b.confidence - a.confidence);
        };

        p.View.Stream.Comments.SortTime = function (a: any, b: any) {
            return (a.created - b.created);
        };

        // Handle stream-building
        p.View.Stream.Main.prototype.buildItemRows = function (items: any) {
            let result = '';

            for (const element of items) {
                result += this.buildItem(element);
            }

            return `<div class="stream-row">${result}</div>`;
        };
    }

    calculateBenisUntilTop(up: any, down: any, date: any) {
        return Math.ceil(7.2857 * down + ((date.getHours() >= 22 || date.getHours() <= 6) ? 15 : 16) - up);
    }

    addItemListener(image: any, itemData: any) {
        this.img = image;
        this.container = this.img[0].parentNode;
        this.resized = (itemData.height > this.container.offsetHeight || itemData.width > this.container.offsetWidth);
        this.container.classList.toggle('resized', this.resized);
        // Enable draggable
        if (this.resized) {
            this.container.classList.add('oversize');
            this.img.draggable();
            this.img.draggable('disable');
        }

        // Handle wheel-change
        if (this.mouseControl) {
            this.container.addEventListener('wheel', (e: any) => {
                e.preventDefault();

                this.handleWheelChange(e);
            });
        }

        if (this.moveLink) {
            this.moveLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMove();
            });
        }

        this.container.addEventListener('click', (e: any) => {
            if (e.target === this.container && this.closeOnBackgroundClick) {
                p.currentView.hideItem();
            }
        });
    }


    handleKeypress(e: any, isInput: boolean = false) {
        if (isInput) {
            if (e.ctrlKey && e.code === 'Enter') {
                $(document.activeElement!).parents('form').find('input[type="submit"]')[0].click();
            }

            return true;
        } else {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.toggleMove();
                    break;
                case 'Escape':
                    if (this.resized && p.currentView.$itemContainer) {
                        p.currentView.hideItem();
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    if (this.isMoveable) {
                        this.img.animate({
                            top: e.code === 'ArrowDown' ? '-=20' : '+=20'
                        }, 0);
                    } else {
                        let elem = this.commentsContainer.find('.scroll-content');
                        if (!elem.is(':focus')) {
                            elem.attr('tabindex', -1).focus();
                        }
                    }
                    break;
            }
        }
    }


    hasUnsentComments() {
        if (p.user.id) {
            for (const element of this.comments) {
                if (element.value !== '') {
                    return true;
                }
            }
        }

        return false;
    }


    toggleMove() {
        if (this.resized) {
            this.img.off('click');
            this.container.classList.toggle('resized');
            this.isMoveable = !this.container.classList.contains('resized');
            this.img.draggable(this.isMoveable ? 'enable' : 'disable');
            this.img.attr('tabindex', -1).focus();

            if (!this.img.resizeInit) {
                this.container.style.alignItems = 'flex-start';
            }

            this.img.resizeInit = true;
        }

        if (!this.isMoveable) {
            this.img.on('click', () => {
                p.currentView.hideItem();
            });
        }
    }


    addNavigation() {
        this.nav.button = document.createElement('a');
        this.nav.links = this.nav.container.querySelectorAll('a');
        this.nav.button.className = 'fa fa-bars sidebar-toggle';
        this.header!.insertBefore(this.nav.button, this.header!.firstChild);

        this.nav.button.addEventListener('click', () => {
            this.toggleNavigation();
        });

        for (const element of this.nav.links) {
            element.addEventListener('click', () => {
                this.toggleNavigation();
            });
        }

        // Init additional menuitems
        this.addMenuItem('pr0p0ll', 'https://pr0p0ll.com', ' fa-bar-chart');
    }


    toggleNavigation() {
        this.nav.container!.classList.toggle('open');
        (this.nav.button! as HTMLElement).classList.toggle('active');
    }


    addMenuItem(name: any, url: any, faClass: any) {
        let elem = document.createElement('a');
        elem.className = faClass;
        elem.innerText = name;
        elem.href = url;
        elem.target = '_blank';
        this.nav.container.firstElementChild!.appendChild(elem);
    }
}
