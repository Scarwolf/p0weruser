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

export type Flag = 'sfw' | 'nsfw' | 'nsfl';

export type P = {
    location: 'top' | 'new';
    user: User;
    mainView: any;
    View: any;
    reload(): any;
}

export type User = {
    admin: boolean;
    id: string;
    flags: number;
    name: string;
    inboxCount: number;
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
}