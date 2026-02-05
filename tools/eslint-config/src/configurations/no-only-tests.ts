// (C) 2025-2026 GoodData Corporation

import type { IDualConfiguration, IPackage } from "../types.js";

const noOnlyTestsPluginV9: IPackage = {
    name: "eslint-plugin-no-only-tests",
    version: "3.3.0",
};

const rules = {
    "no-only-tests/no-only-tests": ["error", { block: ["fixture"], focus: ["only"] }],
};

const v9 = {
    packages: [noOnlyTestsPluginV9],
    plugins: { "no-only-tests": noOnlyTestsPluginV9 },
    rules,
};

export const noOnlyTests: IDualConfiguration<"no-only-tests"> = {
    v8: {
        packages: [
            {
                name: "eslint-plugin-no-only-tests",
                version: "2.6.0",
            },
        ],
        plugins: ["no-only-tests"],
        rules,
    },
    v9,
    ox: v9,
};
