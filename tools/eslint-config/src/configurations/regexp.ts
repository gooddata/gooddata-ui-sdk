// (C) 2025-2026 GoodData Corporation

import { regexpPlugin, regexpRules } from "@gooddata/lint-config";

import type { IConfiguration, IConfigurationFlat } from "../types.js";

const common: IConfigurationFlat = {
    packages: [regexpPlugin],
    plugins: { regexp: regexpPlugin },
    rules: regexpRules,
};

export const regexp: IConfiguration = {
    legacy: {
        packages: [
            {
                name: regexpPlugin.name,
                version: "2.10.0",
            },
        ],
        plugins: ["regexp"],
        rules: regexpRules,
    },
    flat: { v9: common, v9ox: {}, v10: common, v10ox: {} },
};
