// (C) 2019-2020 GoodData Corporation

/**
 * @public
 */
export interface IObjectMeta {
    readonly id: string;
    readonly uri: string;
    readonly title: string;
    readonly description: string;
    readonly production: boolean;
    readonly category?: string;
}
