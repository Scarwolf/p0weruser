import { ModuleSetting, PoweruserModule } from '@/types';
import Settings from '@/core/Settings/Settings';
import Utils, { loadStyle } from "@/Utils";
import style from './viewedPostsMarker.less?inline';

const viewedPostsStorageV1 = "viewed_posts";
const viewedPostsStorageV2 = "viewed_posts_binary";
const viewedPostsStorageBackup = "viewed_posts_backup";

export default class ViewedPostsMarker implements PoweruserModule {
  readonly id = "ViewedPostsMarker";
  readonly name = '"Bereits gesehen"-Markierung';
  readonly description = "Markiert bereits gesehene Medien.";
  readonly markOwnFavoritesAsViewed = Settings.get(
    "ViewedPostsMarker.settings.mark_own_favorites_as_viewed"
  );

  private viewedPosts: number[] = [];

  async load() {
    let _this = this;

    if (this.needsMigration()) {
      console.log("Starting migration...");
      this.migrate();
      console.log("Migration complete!");
    }

    const viewedPosts = this.loadFromLocalStorage();
    this.updateViewedPosts(viewedPosts);
    console.log(viewedPosts);
    window.addEventListener("userSync", () => {
      this.writeToLocalStorage(this.viewedPosts);
    });

    // TODO: Fire event only once
    $(document).ajaxComplete((event, request, settings) => {
      /* Since this is a global event handler for every ajax we need to specify on which event
       * it should be fired. This is the case for every event which accesses items.
       */
      if (settings.url!.startsWith("/api/items/get")) {
        if (
          this.markOwnFavoritesAsViewed ||
          !this.wouldLoadUserCollection(settings.url!)
        ) {
          this.viewedPosts.forEach((post: number) => {
            if (this.isSeen(post)) {
              ViewedPostsMarker.markAsViewed(post);
            }
          });
        }
      }
    });

    p.View.Stream.Item = p.View.Stream.Item.extend({
      show: function (
        rowIndex: any,
        itemData: any,
        defaultHeight: any,
        jumpToComment: any
      ) {
        this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

        _this.mergeIntoViewedPosts(itemData.id);
        ViewedPostsMarker.markAsViewed(itemData.id);
      },
    });

    // Fix audio-controls
    Utils.addVideoConstants();
    loadStyle(style);
  }

  static markAsViewed(id: number) {
    let elem = document.querySelector(`#item-${id} > p-thumbnail`);

    if (elem) {
      elem.setAttribute("seen", "");
    }
  }

  getSettings(): ModuleSetting[] {
    return [
      {
        id: "mark_own_favorites_as_viewed",
        title: "Eigene Favoriten ebenfalls als gelesen markieren",
        description:
          "Markiert Posts in den persönlichen Sammlungen als gelesen",
        type: "checkbox",
      },
    ];
  }

  /**
   * Checks any url whether this url would load any of the logged in users collection
   */
  wouldLoadUserCollection(url: string): boolean {
    const name = p.user.name;
    const queryParams = new URLSearchParams(url);

    // If the current request would retrieve any of the users collection
    return queryParams.has("collection") && queryParams.get("user") === name;
  }

  private loadFromLocalStorage(): number[] {
    const binaryViewedPosts =
      window.localStorage.getItem(viewedPostsStorageV2) || "";
    const encoded = Uint8Array.from(atob(binaryViewedPosts), (c) =>
      c.charCodeAt(0)
    );

    return this.parseSeenPostIdsFromBinary(encoded);
  }

  private writeToLocalStorage(ids: number[]) {
    const binary = this.convertPostIdsToBinary(ids);

    let decoded = "";
    for (let i = 0; i < binary.length; i += 500_000) {
      const chunk = binary.slice(i, i + 500_000);
      // We need to do it in chunks because otherwise an error is thrown.
      // 500.000 seems to work fine.
      decoded += String.fromCharCode(...chunk);
    }

    window.localStorage.setItem(viewedPostsStorageV2, btoa(decoded));
  }

  private migrate() {
    const lsViewedPosts = window.localStorage.getItem(viewedPostsStorageV1);

    if (lsViewedPosts === null) {
      throw new Error("Viewed Posts where not found");
    }
    const parsedPosts = JSON.parse(lsViewedPosts) as number[];

    // For better safety we try load the viewed posts in binary representation
    // and merge them into our parse posts
    const lsViewedPostsV2 = window.localStorage.getItem(viewedPostsStorageV2);
    if (lsViewedPostsV2 !== null) {
      const ids = this.loadFromLocalStorage();
      parsedPosts.push(...ids);
    }

    this.writeToLocalStorage(parsedPosts);
    window.localStorage.setItem(viewedPostsStorageBackup, lsViewedPosts);
    window.localStorage.removeItem(viewedPostsStorageV1);
  }

  private needsMigration(): boolean {
    const lsViewedPosts = window.localStorage.getItem(viewedPostsStorageV1);
    // Using the Settings.set() methods from p0weruser it is possible
    // for the value to be "true".
    if (lsViewedPosts === null || lsViewedPosts === "true") {
      return false;
    }

    const parsedPosts = JSON.parse(lsViewedPosts) as number[];
    return parsedPosts.length > 0;
  }

  private mergeIntoViewedPosts(id: number) {
    // For the moment we just resort the array. I want to have a stable API to tweak
    // the algorithm in the future.
    this.updateViewedPosts([...new Set([...this.viewedPosts, id])]);
  }

  private updateViewedPosts(ids: number[]) {
    // Note that we need to sort the array because we want to do some binary search
    // operation on it.
    // This method needs to be called whenever the viewed posts are being updated.
    // Do not attempt to update the property on your own
    this.viewedPosts = ids.sort((a, b) => a - b);
  }

  private isSeen(id: number): boolean {
    // Binary search through the array
    let start = 0;
    let end = this.viewedPosts.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);

      if (this.viewedPosts[mid] === id) {
        return true;
      }

      if (id < this.viewedPosts[mid]) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
    return false;
  }

  private convertPostIdsToBinary(ids: number[]): Uint8Array {
    const seenBits = new Uint8Array(8_000_000 / 8).fill(0);

    for (const id of ids) {
      const idx = Math.trunc(id / 8);
      if (idx < 0 || idx >= seenBits.length) {
        throw new Error(`ID ${id} exceeded limit`);
      }
      const value = seenBits[idx];
      const update = value | (1 << (7 - (id % 8)));
      seenBits[idx] = update;
    }

    return seenBits;
  }

  private parseSeenPostIdsFromBinary(bytes: Uint8Array): number[] {
    let arr: number[] = [];

    for (let index = 0; index < bytes.length; index++) {
      const element = bytes[index];
      arr.push(...this.parsePostIdFromByte(element, index));
    }
    return arr;
  }

  private parsePostIdFromByte(byte: number, index: number): number[] {
    let arr = [];

    /*
     * Example:
     *   Byte: 0xB3 (10110011)
     *   Index: 2
     *
     * | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Index |
     * |---|---|---|---|---|---|---|---|-------|
     * | 1 | 0 | 1 | 1 | 0 | 0 | 1 | 1 |   2   |
     *
     * Contains the follwing post IDs:
     *   - 16 (seen)
     *   - 17
     *   - 18 (seen)
     *   - 19 (seen)
     *   - 20
     *   - 21
     *   - 22 (seen)
     *   - 23 (seen)
     */
    for (let i = 0; i < 8; i++) {
      if ((byte & (1 << i)) !== 0) {
        arr.push(7 - i + 8 * index);
      }
    }

    return arr;
  }
}
