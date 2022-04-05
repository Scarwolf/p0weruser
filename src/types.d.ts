export type Flag = 'sfw' | 'nsfw' | 'nsfl';

export type P = {
    location: 'top' | 'new',
    user: User
}

export type User = {
    admin: boolean;
    id: string;
    flags: number;
    name: string;
}