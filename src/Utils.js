/**
 * @typedef {{
 *   url: string,
 *   params: Record<string, string>
 * }} URLParams
 */

/**
 * Utilities
 */
export default class Utils {
    /**
     * Waits for a particular element to appear on the DOM
     * @param {string} selector 
     * @returns {Promise<unknown[]>} 
     */
    static waitForElement(selector) {
        return new Promise((resolve, _reject) => {
            let element = [];
            let check = () => {
                if (!element[0]) {
                    element = document.querySelectorAll(selector);

                    setTimeout(() => {
                        check();
                    }, 10);
                } else {
                    resolve(element);
                }
            };

            check();
        });
    }

    /**
     * Escapes particular HTML Chars from string
     * @param {string} input 
     * @returns {string} 
     */
    static escapeHtml(input) {
        return String(input).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }


    /**
     * Sets location
     * @param {string} newLocation 
     * @returns {void}
     */
    static changeLocation(newLocation) {
        p.location = newLocation;
        window.history.pushState({}, 'pr0gramm.com', newLocation);
    }

    /**
     * Retrieves URL params from a given URL
     * @param {string} url 
     * @returns {URLParams}
     */
    static getUrlParams(url) {
        let result = {};
        url = url.split('?');
        let params = url[1].split('&');

        params.forEach(param => {
            let p = param.split('=');
            result[p[0]] = p[1];
        });

        return {
            url: url[0],
            params: result
        };
    }

    // TODO: Unused ?
    static isElementInViewport(el) {
        if (typeof jQuery === 'function' && el instanceof jQuery) {
            el = el[0];
        }

        let rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Create a URL from parameters
     * @param {string} url 
     * @param {URLParams} params 
     * @returns {string}
     */
    static getUrlFromParams(url, params) {
        let result = url + '?';

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                if (result !== url + '?') {
                    result += '&';
                }
                result += key + '=' + params[key];
            }
        }

        return result;
    }


    // TODO: unsued?
    static insertAfter(node, reference) {
        reference.parentNode.insertBefore(node, reference.nextSibling);
    }


    /**
     * @returns {void}
     */
    static addPrototypes() {
        String.prototype.replaceArray = function (find, replace) {
            let replaceString = this;
            for (let i = 0; i < find.length; i++) {
                replaceString = replaceString.replace(find[i], replace[i]);
            }
            return replaceString;
        };
    }


    /**
     * Add constants, related to video-controls
     * @returns {void}
     */
    static addVideoConstants() {
        p.View.Stream.Item.TARGET = {
            NOTHING: 0,
            SEEK_CONTROLS: 1,
            VOLUME_CONTROLS: 2
        };
    }
}
