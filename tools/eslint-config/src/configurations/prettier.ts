// (C) 2025 GoodData Corporation

import prettierConfig from "eslint-config-prettier";

import type { IDualConfiguration, IPackage } from "../types.js";
const prettierPackage: IPackage = {
    name: "prettier",
    version: "^3.6.2",
};

const eslintConfigPrettier: IPackage = {
    name: "eslint-config-prettier",
    version: "10.1.8",
};

const eslintPluginPrettier: IPackage = {
    name: "eslint-plugin-prettier",
    version: "5.5.4",
};

const packages = [prettierPackage, eslintConfigPrettier, eslintPluginPrettier];

export const prettier: IDualConfiguration<"prettier"> = {
    v8: {
        packages,
        extends: ["plugin:prettier/recommended"],
    },
    v9: {
        packages,
        plugins: { prettier: eslintPluginPrettier },
        rules: {
            ...prettierConfig.rules,
            "prettier/prettier": "error",
        },
    },
};
