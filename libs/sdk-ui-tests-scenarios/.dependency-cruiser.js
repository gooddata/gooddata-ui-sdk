// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
} from "../../common/config/dep-cruiser/default.config.js";

// eslint-disable-next-line no-restricted-exports
export default {
    forbidden: [
        // not-to-dev-dep: all deps are dev because this package is tooling and its dependencies occurred in FOSSA scan
        // not-to-unresolvable: dep-cruiser can't resolve subpath exports (e.g. storybook/actions), TypeScript handles this
        ...DefaultRules.filter(
            (rule) => rule.name !== "not-to-dev-dep" && rule.name !== "not-to-unresolvable",
        ),
        ...DefaultSdkRules,
    ],
    options: DefaultOptions,
};
