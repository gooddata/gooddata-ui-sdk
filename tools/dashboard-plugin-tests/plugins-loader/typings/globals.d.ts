// (C) 2007-2021 GoodData Corporation

// Globals injected by webpack
// eslint-disable-next-line header/header
declare module "*.png" {
    const contents: string;
    export = contents;
}
declare module "*.svg" {
    const contents: string;
    export = contents;
}
declare module "*.ico" {
    const contents: string;
    export = contents;
}

declare const WORKSPACE: string;

declare function __webpack_init_sharing__(scope: string): Promise<void>;
declare const __webpack_share_scopes__: any;
