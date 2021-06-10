export default class EventHandler {
    constructor() {
        this.settingsLoaded = new Event('settingsLoaded');
        this.commentsLoaded = new Event('commentsLoaded');
        this.locationChange = new Event('locationChange');
        this.beforeLocationChange = new Event('beforeLocationChange');
        this.userSync = new Event('userSync');
        this.locationPattern = new RegExp('\\d+$');

        this.addEvents();
    }


    addEvents() {
        let _this = this;

        // Add settings-event
        (function (render) {
            p.View.Settings.prototype.render = function (params) {
                render.call(this, params);
                window.dispatchEvent(_this.settingsLoaded);
            };
        }(p.View.Settings.prototype.render));

        // Add locationchange event
        (function (navigate) {
            p.navigateTo = function (location, mode) {
                _this.beforeLocationChange.mode = mode;
                window.dispatchEvent(_this.beforeLocationChange);

                // Call original
                navigate.call(this, location, mode);

                _this.locationChange.mode = mode;
                _this.locationChange.isPost = _this.locationPattern.test(location);
                window.dispatchEvent(_this.locationChange);
            };
        }(p.navigateTo));

        // Add locationchange event
        window.onpopstate = function (e) {
            _this.locationChange.mode = 0;
            _this.locationChange.isPost = _this.locationPattern.test(e.currentTarget.location.pathname);

            window.dispatchEvent(_this.locationChange);
        };

        // Add commentsloaded-event
        (function (render) {
            p.View.Stream.Comments.prototype.render = function () {
                render.call(this);
                _this.commentsLoaded.data = this.$container;
                window.dispatchEvent(_this.commentsLoaded);

            };
        }(p.View.Stream.Comments.prototype.render));

        (function (syncCallback) {
            p.User.prototype.syncCallback = function (response) {
                _this.userSync.data = response;
                syncCallback.call(this, response);
                window.dispatchEvent(_this.userSync);
            };
        }(p.User.prototype.syncCallback));
    }
}
