// (C) 2024 GoodData Corporation

// Globals injected by webpack
// eslint-disable-next-line header/header
declare module "*.png" {
    const contents: string;
    export default contents;
}
declare module "*.svg" {
    const contents: string;
    export default contents;
}
declare module "*.ico" {
    const contents: string;
    export default contents;
}

declare const BUILD_TYPE: string;

declare const BACKEND_URL: string;
declare const WORKSPACE: string;

declare const BASEPATH: string;
declare const BUILTIN_MAPBOX_TOKEN: string;
