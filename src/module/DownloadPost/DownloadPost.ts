import Settings from '@/core/Settings/Settings';
import { ModuleSetting, P, PoweruserModule } from '@/types';

export default class DownloadPost implements PoweruserModule {
    readonly id = 'DownloadPost';
    readonly name = 'Posts in hoher Auflösung herunterladen';
    readonly description = 'Fügt einen Button zu jedem Post hinzu, um den Post in höchster Qualität herunterzuladen.';
    readonly isDownloadButtonEnabled = Settings.get("DownloadImage.settings.download_image");

    async load() {
      this.initDownloadButton();
    }

    initDownloadButton() {
      if(!this.isDownloadButtonEnabled) return;
      window.addEventListener('locationChange', () => {
        const itemInfoBox = $('.item-info');
        const downloadButton = $('<button id="p0weruser-download-button">D0wnload</button>');
        downloadButton.on("click", this.onDownloadClick);
        itemInfoBox.append(downloadButton);
      });
    }

    onDownloadClick() {
      const fullsizeLink = $('.item-fullsize-link').attr("href");
      const mediaLink = $('.item-image-actual').attr("src");

      const mediaUrl = "https:" + (fullsizeLink ? fullsizeLink : mediaLink);
      const xhr = new XMLHttpRequest();
      const tags = $(".item-tags .tags").children();
      const type = mediaUrl.match(/\.([a-zA-Z0-9]+)$/)[0];
      const fileNameTags = tags.toArray().slice(0, tags.length-3).map(e => e.children[0].textContent);

      xhr.open("GET", mediaUrl, true);
      xhr.responseType = "blob";
      // TODO button ist nicht visible, wenn man das erste mal ein bild anklickt, sondern erst nachdem man mindestens 1x die location gechanged hat
      xhr.onload = () => {
        if(xhr.status !== 200) return;
        const imageBlob = xhr.response;
        const tempUrl = URL.createObjectURL(imageBlob);

        // not sure about this part - maybe there's an easier way that includes the p0weruser-download-button?
        const downloadLink = $("<a>").attr("href", tempUrl).attr("download", fileNameTags.join("_") + type);
        downloadLink[0].click();
      };

      xhr.send();
    }

    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'download_image',
                title: 'Bilder-Downloader',
                description: 'Lade die Bilder herunter!',
                type: "checkbox"
            }
        ];
    }
}
