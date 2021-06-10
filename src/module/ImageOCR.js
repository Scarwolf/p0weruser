import Tesseract from 'tesseract.js';
import SimpleBar from 'simplebar';
import Utils from '../Utils';

export default class ImageOCR {
    constructor() {
        this.id = 'ImageOCR';
        this.name = 'Texterkennung';
        this.description = 'Extrahiere Text aus Bildern.'
    }


    load() {
        this.styles = require('../style/imageOCR.less');
        this.template = require('../template/ocrPopup.html');
        this.searchWording = 'Verarbeite Bild...';
        this.popup = document.createElement('div');
        this.popup.id = 'ocr-popup';
        this.$popup = $(this.popup);
        this.popup.innerHTML = this.template;
        this.textbox = this.$popup.find('.content')[0];
        this.close = this.$popup.find('.close-popup')[0];

        this.addButton();
    }


    addButton() {
        let _this = this;

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex, itemData, defaultHeight, jumpToComment) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                if (itemData.video === false) {
                    let container = this.$image.parent();
                    let button = document.createElement('span');
                    button.innerHTML = `<span class="fa fa-search ocr-button"></span>`;
                    container[0].appendChild(button);

                    button.addEventListener('click', () => {
                        $('.item-image-wrapper').after(_this.popup);

                        _this.checkImage();
                    });

                    _this.close.addEventListener('click', () => {
                        _this.togglePopup();
                    });
                }
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();
    }


    checkImage() {
        let image = document.getElementsByClassName('item-image-actual')[0];
        this.textbox.innerText = this.searchWording;
        this.popup.classList.add('visible');

        GM_xmlhttpRequest({
            url: image.src,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: {
                'cache-control': 'no-cache',
                'Upgrade-Insecure-Requests': 1
            },
            onload: (res) => {
                Tesseract.recognize(new Blob([new Uint8Array(res.response)]), {
                    lang: 'deu'
                }).then(result => {
                    this.togglePopup(result.text);
                    new SimpleBar(this.popup);
                }).catch(err => {
                    this.togglePopup();
                });
            }
        });
    }


    togglePopup(text = false) {
        if (!text) {
            this.popup.classList.remove('visible');

            return false;
        }

        this.textbox.innerText = text;
    }
}
