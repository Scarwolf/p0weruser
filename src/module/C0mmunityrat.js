import Settings from '../Settings';

export default class C0mmunityrat {
    constructor() {
        this.id = 'c0mmunityrat';
        this.name = 'c0mmunityrat - Notification';
        this.description = 'Lasse dich über Neuigkeiten informieren.';
        this.lastPost = 0;
        this.elem = null;
        this.loaded = false;
    }


    load() {
        if (!this.loaded) {
            this.lastPost = +Settings.get('c0mmunityrat');
            this.styles = require('../style/c0mmunityrat.less');

            window.addEventListener('userSync', (e) => {
                fetch('https://pr0gramm.com/api/items/get?flags=15&user=c0mmunityrat').then(r => r.json()).then(res => {
                    if (res.items[0].id !== this.lastPost && !this.elem) {
                        this.showNotification(res.items[0].id);
                    }
                });
            });
        }
    }


    showNotification(postId) {
        let elem = document.createElement('a');
        elem.innerText = 'c0mmunityrat - Es gibt Neuigkeiten!';
        elem.className = 'news-label';
        elem.href = 'https://pr0gramm.com/top/' + postId;
        elem.target = '_blank';
        this.elem = elem;

        elem.onclick = () => this.markAsRead(postId);

        document.getElementById('pr0gramm-logo-link').after(elem);
    }

    markAsRead(postId) {
        this.elem.remove();
        this.lastPost = postId;
        Settings.set('c0mmunityrat', this.lastPost);
    }
}
