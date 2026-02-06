// (C) 2026 GoodData Corporation

import { type IConfiguration } from "../types.js";

export const browserEnv: IConfiguration = {
    overrides: [
        {
            files: ["*"],
            env: {
                browser: true,
            },
        },
    ],
};
