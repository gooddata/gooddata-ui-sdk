export interface IObjectMeta {
    author?: string;
    category?: string;
    contributor?: string;
    created?: Date;
    deprecated?: boolean;
    identifier?: string;
    isProduction?: boolean;
    locked?: boolean;
    projectTemplate?: string;
    sharedWithSomeone?: boolean;
    summary?: string;
    tags?: string;
    title: string;
    unlisted?: boolean;
    updated?: Date;
    uri?: string;
}
