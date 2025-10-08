// (C) 2025 GoodData Corporation

import type { IConfiguration } from "../types.js";

const configuration: IConfiguration<"cypress"> = {
    packages: [
        {
            name: "eslint-plugin-cypress",
            version: "2.15.2",
        },
    ],
    plugin: "cypress",
    extends: ["plugin:cypress/recommended"],
    rules: {
        //this will be nice to fixed
        "cypress/no-unnecessary-waiting": "warn",

        "cypress/no-assigning-return-values": "warn",

        //this unsafe-to-chain-command needs to be set on and all problems fixed
        "cypress/unsafe-to-chain-command": "warn",
    },
};

export default configuration;
