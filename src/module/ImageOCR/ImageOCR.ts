import Tesseract from 'tesseract.js';
import SimpleBar from 'simplebar';
import Utils from '@/Utils';
// @ts-ignore
import template from '../../../assets/template/ocrPopup.html?raw'; // TODO
import { PoweruserModule } from '@/types';

export default class ImageOCR implements PoweruserModule {
    readonly id = 'ImageOCR';
    readonly name = 'Texterkennung';
    readonly description = 'Extrahiere Text aus Bildern.'

    readonly searchWording = 'Verarbeite Bild...';
    popup?: HTMLDivElement;
    $popup?: JQuery<HTMLDivElement>;
    textbox?: HTMLElement;
    close?: HTMLElement;
    

    async load() {
        const popup = document.createElement('div');
        popup.id = 'ocr-popup';
        this.popup = popup;
        this.$popup = $(this.popup);
        this.popup.innerHTML = template;
        this.textbox = this.$popup.find('.content')[0];
        this.close = this.$popup.find('.close-popup')[0];

        this.addButton();
        // @ts-ignore
        await import('./imageOCR.less');
    }


    addButton() {
        let _this = this;

        p.View.Stream.Item = p.View.Stream.Item.extend({
            show: function (rowIndex: any, itemData: any, defaultHeight: any, jumpToComment: any) {
                this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

                if (itemData.video === false) {
                    let container = this.$image.parent();
                    let button = document.createElement('span');
                    button.innerHTML = `<span class="fa fa-search ocr-button"></span>`;
                    container[0].appendChild(button);

                    button.addEventListener('click', () => {
                        $('.item-image-wrapper').after(_this.popup!);

                        _this.checkImage();
                    });

                    _this.close!.addEventListener('click', () => {
                        _this.togglePopup();
                    });
                }
            }
        });

        // Fix audio-controls
        Utils.addVideoConstants();
    }


    checkImage() {
        let image = document.getElementsByClassName('item-image-actual')[0] as HTMLImageElement;
        this.textbox!.innerText = this.searchWording;
        this.popup!.classList.add('visible');

        GM.xmlHttpRequest({
            url: image.src,
            method: 'GET',
            //@ts-ignore
            responseType: 'arraybuffer',
            headers: {
                'cache-control': 'no-cache',
                'Upgrade-Insecure-Requests': '1'
            },
            onload: (res) => {
                Tesseract.recognize(new Blob([new Uint8Array(res.response)]), 'deu')
                    .then(result => {
                        this.togglePopup(result.data.text);
                        new SimpleBar(this.popup!);
                    }).catch(err => {
                        this.togglePopup();
                    });
            }
        });
    }


    togglePopup(text?: string) {
        if (!text) {
            this.popup!.classList.remove('visible');

            return false;
        }

        this.textbox!.innerText = text;
    }
}
