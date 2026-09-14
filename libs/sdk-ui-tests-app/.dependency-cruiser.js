// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
} from "../../common/config/dep-cruiser/default.config.js";

export default {
    forbidden: [
        // we need all dep in dev because this package is tooling and its dependencies ocurred in FOSSA scan
        ...DefaultRules.filter((rule) => rule.name !== "not-to-dev-dep"),
        ...DefaultSdkRules,
    ],
    options: DefaultOptions,
};
