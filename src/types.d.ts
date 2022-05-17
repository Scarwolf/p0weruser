export type PoweruserModuleId = string;

export type PoweruserModule = {
    readonly id: PoweruserModuleId;
    readonly name: string;
    readonly description: string;
    load(): void;
    getSettings?: () => ModuleSetting[]
};

export type ModuleSettingType = 'text' | 'number' | 'checkbox';

export type ModuleSetting = {
    id: string;
    title: string;
    description: string;
    type: ModuleSettingType;
};

export type FlagName = 'sfw' | 'nsfw' | 'nsfl';

export type P = {
    currentView: any;
    NAVIGATE: any;
    location: 'top' | 'new';
    user: User;
    mainView: any;
    View: any;
    reload(): any;
    api: any;
    shouldShowScore: (thing: any) => any;
    navigateTo: (location: any, mode?: any) => any;
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
    id: string;
    flags: number;
    name: string;
    inboxCount: number;
    setInboxLink: (inbox: any) => any;
}

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
    }
    READ_ONLY: boolean;
    HOST: string;
    HEADER_HEIGHT: number;
}

export type UserSyncEvent = {
    type: "userSync";
    data: {
        score: number;
        inbox: {
            comments: number;
            mentions: number;
            messages: number;
            notifications: number;
            follows: number;
        }
    }
};

declare global {
    const p: P;
    const CONFIG: GlobalPr0Config;
}