// (C) 2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const oxfmtPackage: IPackage = {
    name: "oxfmt",
    version: "0.27.0",
};

const oxfmtPlugin: IPackage = {
    name: "eslint-plugin-oxfmt",
    version: "0.0.11",
};

export const oxfmt: IDualConfiguration<"", "oxfmt"> = {
    v8: {}, // no v8 support
    v9: {
        packages: [oxfmtPackage, oxfmtPlugin],
        plugins: { oxfmt: oxfmtPlugin },
        rules: {
            "oxfmt/oxfmt": "error",
        },
    },
};
