// Globals injected by webpack
declare var BASEPATH: string;

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
