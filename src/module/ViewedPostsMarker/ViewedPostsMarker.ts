import { ModuleSetting, PoweruserModule, SetBitsResponse } from "@/types";
import Settings from "@/core/Settings/Settings";
import Utils, { loadStyle } from "@/Utils";
import style from "./viewedPostsMarker.less?inline";
import { deflate } from "pako";

// Magic Strings
const viewedPostsStorageV1 = "viewed_posts";
const viewedPostsStorageV2 = "viewed_posts_binary";
const viewedPostsStorageBackup = "viewed_posts_backup";
const pr0grammBitsVersionHeader = "X-pr0gramm-Bits-Version";
const pr0grammNonceHeader = "X-pr0gramm-Nonce";

export default class ViewedPostsMarker implements PoweruserModule {
  readonly id = "ViewedPostsMarker";
  readonly name = '"Bereits gesehen"-Markierung';
  readonly description = "Markiert bereits gesehene Medien.";
  readonly markOwnFavoritesAsViewed = Settings.get(
    "ViewedPostsMarker.settings.mark_own_favorites_as_viewed"
  );
  readonly syncRead = Settings.get(
    "ViewedPostsMarker.settings.sync_read",
    false
  );
  readonly syncWrite = Settings.get(
    "ViewedPostsMarker.settings.sync_write",
    false
  );

  private syncVersion: number | null = null;
  private viewedPosts: number[] = [];
  private needsSync = false;

  async load() {
    let _this = this;

    if (this.needsMigration()) {
      console.log("Starting migration...");
      this.migrate();
      console.log("Migration complete!");
    }

    const viewedPosts = this.loadFromLocalStorage();
    this.updateViewedPosts(viewedPosts);

    window.addEventListener("userSync", async () => {
      // When a user is logged in we can try to synchronize with pr0gramm servers
      if (p.user.id !== undefined) {
        try {
          if (this.syncRead) {
            const apiViewedPosts = await this.loadFromApi();
            this.mergeIntoViewedPosts(apiViewedPosts);
            if (this.syncWrite && this.syncVersion !== null && this.needsSync) {
              await this.writeToApi(this.viewedPosts);
            }
          }
        } catch (err) {
          console.error("Synchronization failed", err);
        }
      }
      this.writeToLocalStorage(this.viewedPosts);
    });

    const originalStreamLoadFn = p.Stream.prototype._load;
    p.Stream.prototype._load = function (
      options: { collection: "favoriten" | unknown; self: boolean },
      callback: any
    ) {
      const result = originalStreamLoadFn.call(this, options, callback);

      const loadsOwnCollection =
        options.collection === "favoriten" && options.self;

      if (loadsOwnCollection && !_this.markOwnFavoritesAsViewed) {
        return;
      }

      for (const item of Object.keys(this.items)) {
        const id = Number(item);
        if (_this.isSeen(id)) {
          ViewedPostsMarker.markAsViewed(id);
        }
      }

      return result;
    };

    p.View.Stream.Item = p.View.Stream.Item.extend({
      show: function (
        rowIndex: any,
        itemData: { id: unknown },
        defaultHeight: any,
        jumpToComment: any
      ) {
        this.parent(rowIndex, itemData, defaultHeight, jumpToComment);

        const id = Number(itemData.id);
        _this.mergeIntoViewedPosts([id]);
        ViewedPostsMarker.markAsViewed(id);
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
      {
        id: "sync_read",
        title: "<strong>Lesend</strong> Synchronisieren",
        description:
          "Synchronisiert <strong>LESEND</strong> mit den pr0gramm Servern. Das bedeutet, dass gesehene Posts aus der App in p0weruser übertragen werden, aber nicht umgekehrt",
        type: "checkbox",
      },
      {
        id: "sync_write",
        title:
          "<strong>Schreibend</strong> Synchronisieren <u><strong>!!! VORSICHT !!!</strong></u>",
        description:
          "Synchronisiert <strong>SCHREIBEND</strong> mit den pr0gramm Servern. Funtkioniert nur in Verbindung mit der Lesenden Option. <strong>Änderungen an der Schnittstelle oder ein Bug in p0weruser kann die Posts kaputt machen. Außerdem ist das Feature noch nicht ausgiebig getestet. Handle with care!</strong>",
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

  private async loadFromApi(): Promise<number[]> {
    const response = await fetch(
      "/api/seen/bits?uncompressed=true&binary=true"
    );
    if (!response.ok) {
      return [];
    }
    const buffer = await response.arrayBuffer();
    const version = Number(response.headers.get(pr0grammBitsVersionHeader));
    if (this.syncVersion === version) {
      return this.viewedPosts;
    }

    this.syncVersion = version;
    return this.parseSeenPostIdsFromBinary(new Uint8Array(buffer));
  }

  private loadFromLocalStorage(): number[] {
    const binaryViewedPosts =
      window.localStorage.getItem(viewedPostsStorageV2) || "";
    const encoded = Uint8Array.from(atob(binaryViewedPosts), (c) =>
      c.charCodeAt(0)
    );

    return this.parseSeenPostIdsFromBinary(encoded);
  }

  private async writeToApi(ids: number[]): Promise<any> {
    if (this.syncVersion === null) {
      throw new Error("Version is null");
    }
    const { id } = p.user;
    if (id === undefined) {
      throw new Error("Not logged In");
    }

    const binary = this.convertPostIdsToBinary(ids);

    const compressed = deflate(binary, { level: 9 });

    const response = await fetch("/api/seen/update", {
      method: "POST",
      body: new Blob([compressed]),
      headers: {
        "Content-Type": "application/octet",
        [pr0grammBitsVersionHeader]: `${this.syncVersion}`,
        [pr0grammNonceHeader]: id.substring(0, 16),
      },
    });

    if (!response.ok) {
      throw new Error("Could not update seen bits");
    }

    const parsedResponse = (await response.json()) as SetBitsResponse;

    if (!parsedResponse.success) {
      throw new Error("Could not update seen bits");
    }

    this.syncVersion = parsedResponse.version;
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

  private mergeIntoViewedPosts(ids: number[]) {
    const getIndex = (value: number, arr: number[]) => {
      let low = 0;
      let high = arr.length;

      while (low < high) {
        let mid = (low + high) >>> 1;
        if (arr[mid] < value) low = mid + 1;
        else high = mid;
      }
      return low;
    };

    for (const id of ids) {
      const idx = getIndex(id, this.viewedPosts);
      if (this.viewedPosts[idx] !== id) {
        this.viewedPosts.splice(idx, 0, id);
        this.needsSync = true;
      }
    }
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
