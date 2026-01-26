// (C) 2026 GoodData Corporation

import type { IConfiguration } from "../types.js";

export const barrelFiles: IConfiguration<"no-barrel-files"> = {
    packages: [
        {
            name: "eslint-plugin-no-barrel-files",
            version: "1.2.2",
        },
    ],
    plugins: ["no-barrel-files"],
    rules: {
        "no-barrel-files/no-barrel-files": "error",
    },
};
