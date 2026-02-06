// (C) 2026 GoodData Corporation

import { type IConfiguration } from "../types.js";

export const env: IConfiguration = {
    overrides: [
        {
            files: ["*"],
            env: {
                node: true,
                es2022: true,
            },
        },
    ],
};
