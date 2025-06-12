// (C) 2007-2021 GoodData Corporation
declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

declare module "*.svg" {
    const value: any;
    export default value;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "validate-npm-package-name" {
    const validate: (value: string) => {
        validForNewPackages: boolean;
        validForOldPackages: boolean;
        errors?: string[];
        warnings?: string[];
    };

    export default validate;
}
