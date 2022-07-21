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

declare const BUILD_TYPE: string;

declare const BACKEND_URL: string;
declare const BACKEND_TYPE: "bear" | "tiger";
declare const WORKSPACE: string;

declare const BASEPATH: string;
declare const BUILTIN_MAPBOX_TOKEN: string;

declare const process: {
    env: Record<string, any>;
};
