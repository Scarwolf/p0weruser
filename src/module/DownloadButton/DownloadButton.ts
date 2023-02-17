import Settings from '@/core/Settings/Settings';
import { ModuleSetting, P, PoweruserModule } from '@/types';

export default class DownloadButton implements PoweruserModule {
    readonly id = 'Download-Button';
    readonly name = 'Posts in hoher Auflösung herunterladen';
    readonly description = 'Fügt einen Button zu jedem Post hinzu, um den Post in höchster Qualität herunterzuladen.';
    readonly isDownloadButtonEnabled = Settings.get("DownloadImage.settings.download_button");

    async load() {
      this.initDownloadButton();
    }

    createButton() {
      const itemInfoBox = document.querySelectorAll(".item-info")[0];
      const downloadButton = document.createElement("button");
      downloadButton.setAttribute("id", "p0weruser-download-button");
      downloadButton.textContent = "D0wnload";
      downloadButton.onclick = this.onDownloadClick;

      itemInfoBox.append(downloadButton);
    }

    initDownloadButton() {
      if(!this.isDownloadButtonEnabled) return;

      window.addEventListener('itemOpened', (ev: Event & any) => {
        this.createButton();
      });
    }

    onDownloadClick() {
      const fullsizeLink = document.querySelectorAll(".item-fullsize-link")[0]?.getAttribute("href");
      const mediaLink = document.querySelectorAll(".item-image-actual")[0]?.getAttribute("src");

      const mediaUrl = "https:" + (fullsizeLink ? fullsizeLink : mediaLink ? mediaLink : "empty");
      const tags = document.querySelectorAll(".item-tags .tags")[0].children;
      const typeMatch = mediaUrl.match(/\.([a-zA-Z0-9]+)$/);
      const type = typeMatch !== null ? typeMatch[0] : ".unknown";
      const fileNameTags = Array.from(tags).slice(0, tags.length - 3).map(e => e.children[0].textContent);

      fetch(mediaUrl)
        .then(res => res.blob())
        .then(blob => {
          const tempLink = document.createElement("a");
          tempLink.href = window.URL.createObjectURL(blob);
          tempLink.download = fileNameTags.join("_") + type;
          tempLink.click();
        });
    }

    getSettings(): ModuleSetting[] {
        return [
            {
                id: 'download_button',
                title: 'Download-Button',
                description: 'Lade deinen Lieblingspost herunter!',
                type: "checkbox"
            }
        ];
    }
}
