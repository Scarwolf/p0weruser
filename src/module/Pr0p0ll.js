import Settings from '../Settings';
import SimpleBar from 'simplebar';
import moment from 'moment';
import Pr0p0llDiagramm from '../lib/Pr0p0llDiagramm';

export default class Pr0p0ll {
    constructor() {
        this.id = 'Pr0p0ll';
        this.name = 'Pr0p0ll Integration';
        this.description = 'Erhalte Benachrichtigungen über neue Umfragen!';
        this.showNotification = Settings.get('Pr0p0ll.settings.show_notification');
        this.token = Settings.get('Pr0p0ll.settings.user_token');
        this.showDiagramms = Settings.get('Pr0p0ll.settings.show_diagramms');
        this.apiUrl = 'https://pr0p0ll.com/?p=viewjson&id=';

        moment.locale('de');
    }


    load() {
        this.styles = require('../style/pr0p0ll.less');
        this.inboxLink = document.getElementById('inbox-link');
        this.template = `<a href="https://pr0p0ll.com/?p=user" target="_blank" class="empty pr0p0ll-count fa fa-edit head-link"><span>0</span></a>`;
        this.inboxLink.after($(this.template)[0]);
        this.target = this.inboxLink.nextSibling.firstChild;

        if (this.token !== 'true') {
            this.addListener();
        }

        p.View.Overlay.Pr0p0llDiagramm = p.View.Base.extend({
            template: require('../template/pr0p0llOverlay.html'),
            init: function (container, parent, params) {
                this.data.p0ll = params.data;
                this.data.dateTo = moment(params.data.info.endedOn, 'X').format('LL');
                this.data.dateFrom = moment(params.data.info.endedOn - params.data.info.duration, 'X').format('LL');
                container[0].classList.add('pr0p0ll-overlay');
                this.parent(container, parent);
            }
        });
    }


    getSettings() {
        return [
            {
                id: 'show_notification',
                title: 'Desktopbenachrichtigung',
                description: 'Zeige eine Desktopbenachrichtigung bei neuen Umfragen!',
            },
            {
                id: 'show_diagramms',
                title: 'Diagramme anzeigen',
                description: 'Diagramme hinter pr0p0ll-links verlinken'
            },
            {
                id: 'user_token',
                title: '"Token für Notificator"',
                description: 'Damit authentifizierst du dich gegenüber pr0p0ll. [<a href="https://pr0p0ll.com/?p=tokengen" target="_blank">Token generieren</a>]',
                type: 'text'
            },
        ];
    }


    addListener() {
        if (this.token !== true && this.token.length > 0) {
            if (RegExp("^([0-9a-f]{64})$").test(this.token.trim())) {
                this.token = this.token.trim().match("^([0-9a-f]{64})$")[0];
                Settings.set('Pr0p0ll.settings.user_token', this.token);

                window.addEventListener('userSync', () => {
                    this.fetchCounter().then(res => {
                        this.updateCounter(res.openPolls);
                    });
                });

                if (this.showDiagramms) {
                    window.addEventListener('commentsLoaded', e => {
                        let links = e.data.find('a[href*="pr0p0ll"][href*="id="]');
                        this.addLinks(links);
                    });
                }
            }
            else {
                window.alert("Bitte öffne die Einstellungen, um einen korrekten Pr0po0ll-Token einzugeben.")
            }
        } else {
            window.alert('Bitte öffne die Einstellungen um das Pr0p0ll-Modul zu konfigurieren.');
        }
    }


    addLinks(links) {
        for (let i = 0; i < links.length; i++) {
            const url = new URL(links[i].href);
            let icon = document.createElement('a');
            icon.className = 'fa fa-bar-chart pr0p0ll-link';

            icon.addEventListener('click', () => {
                const pollId = url.searchParams.get('pollid');
                const id = parseInt(pollId ? pollId : url.searchParams.get('id'));

                Settings.set('Pr0p0ll.settings.last_count', 0);

                this.showDiagramm(id);
            });

            links[i].after(icon);
        }
    }


    showDiagramm(id) {
        let getDiagramm = () => {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    url: this.apiUrl + id,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'p0weruser'
                    },
                    onload: (res) => {
                        const response = JSON.parse(res.responseText);

                        if (response.error) {
                            reject(response.error);
                        }

                        resolve(response);
                    }
                });
            });
        };

        getDiagramm().then(
            result => {
                p.mainView.showOverlay(p.View.Overlay.Pr0p0llDiagramm, {
                    data: result
                });

                const diag = new Pr0p0llDiagramm(result);
                new SimpleBar(document.getElementById('overlay-box'));
            },
            error => {
                window.alert(error);
            }
        );
    }


    fetchCounter() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                url: `https://pr0p0ll.com/?p=notify&token=${this.token}`,
                method: 'GET',
                headers: {
                    'User-Agent': 'p0weruser'
                },
                onload: (res) => {
                    resolve(JSON.parse(res.responseText));
                }
            });
        })
    }


    updateCounter(score) {
        score = parseInt(score) || 0;
        if (this.showNotification && Settings.get('Pr0p0ll.settings.last_count') < score) {
            GM_notification(
                'Du hast ' + (score === 1 ? 'eine neue Umfrage!' : score + ' neue Umfragen!'),
                'pr0p0ll',
                'https://pr0p0ll.com/src/favicon.png',
                function () {
                    window.focus();
                    window.location.href = 'https://pr0p0ll.com/?p=user';
                }
            );
        }

        this.target.parentNode.classList.toggle('empty', score === 0 || !score);
        this.target.innerText = score;
        Settings.set('Pr0p0ll.settings.last_count', score);
    }
}
