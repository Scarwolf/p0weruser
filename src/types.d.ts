export type PoweruserModuleId = string;

export type PoweruserModule = {
    readonly id: PoweruserModuleId;
    readonly name: string;
    readonly description: string;
    load(): Promise<void>;
    getSettings?: () => ModuleSetting[]
};

export type ModuleSettingType = 'text' | 'number' | 'checkbox';

export type ModuleSetting = {
    id: string;
    title: string;
    description: string;
    type: ModuleSettingType;
};

export type FlagName = 'sfw' | 'nsfw' | 'nsfl' | 'nsfp' | 'pol';

export type SetBitsResponse = {
  success: boolean;
  version: number;
};

export type P = {
  _routes: any[];
  _dispatch: (arg1: unknown | null, arg2: boolean) => unknown;
  currentView: null | {
    $itemContainer: unknown;
    currentItemId: number | null;
    stream: StreamInView | undefined;
    hideItem(): unknown;
    load(): void;
  };
  NAVIGATE: {
    DEFAULT: 0;
    SILENT: 1;
    FORCE: 2;
  };
  location: string;
  user: User;
  mainView: any;
  Stream: Stream;
  View: {
    Stream: {
      Main: StreamMainView;
      Item: BaseView & any;
      Comments: BaseView & any;
    };
    Base: BaseView;
    Overlay: BaseView & any;
    InboxMessages: any;
    Settings: any;
    P0weruserSettings: any;
  };
  reload(): any;
  api: any;
  shouldShowScore: (thing: any) => any;
  navigateTo: (location: any, mode?: any) => any;
  addRoute: (viewClass: any, path: any) => any;
  merge: (a: any, b: any) => any;
  getURL(): string;
  mobile: boolean;
};

// I don't know if its the same stream
export type StreamInView = {
  options:
    | undefined
    | {
        collection: "favoriten" | unknown;
        self: boolean;
        user: string;
      };
  items: Record<number, StreamItem>;
};

export type Stream = {
    _load: (options: any, callback: any) => any;
    prototype: any;
}

export type User = {
  voteCache: any;
  cookie: {
    t: number;
    lp: boolean;
    lv: number;
    n: string;
    id: string;
    verified: boolean;
  };
  flagsName: any;
  admin: boolean;
  id: string | undefined;
  flags: number;
  name: string;
  inboxCount: number;
  setInboxLink: (inbox: any) => any;
};

export type Flag = {
    flag: number;
    name: FlagName;
};

export type GlobalPr0Config = {
    ABSOLUTE_PATH: string;
    ADS: {
        ACCOUNT: string;
        AMAZON_REF: false;
        REFRESH_INTERVAL: number;
    };
    API: {
        ENDPOINT: string;
        ALLOWED_UPLOAD_TYPES: string[];
    };
    PATH: {
        FULLSIZE: string;
        IMAGES: string;
        THUMBS: string;
        VIDS: string;
    };
    SFW_FAG: {
        NSFL: Flag;
        NSFP: Flag;
        NSFW: Flag;
        SFW: Flag;
        POL: Flag;
    }
    READ_ONLY: boolean;
    HOST: string;
    HEADER_HEIGHT: number;
}

export type UserInbox = {
  comments: number;
  mentions: number;
  messages: number;
  notifications: number;
  follows: number;
  digests: number;
}

export type UserSyncEvent = {
    type: "userSync";
    data: {
        score: number;
        inbox: UserInbox;
    }
};

export type ItemResult = {
    items: StreamItem[];
};

export type StreamItem = {
    audio: boolean;
    created: number;
    down: number;
    fav: number;
    flags: number;
    height: number;
    id: number;
    image: string;
    mark: number;
    promoted: number;
    source: string;
    thumb: string;
    up: number;
    user: string;
    userId: number;
    vote: number;
    width: number;
    preview: string;
    tags: ItemTag[];
  seen: boolean;
};

export type ItemTag = {
  id: number;
  confidence: number;
  tag: string;
}

export type BaseView = {
    template: string;
    prototype: any; // TODO
    extend(smth: any): any;
};

export type StreamMainView = BaseView & {
    buildItem(item: StreamItem): string;
};

declare global {
    const p: P;
    const CONFIG: GlobalPr0Config;
}
