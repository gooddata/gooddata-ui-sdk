// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
    PublicLibraryRules,
    isolatedSubmodule,
    moduleWithDependencies,
} from "../../common/config/dep-cruiser/default.config.js";

// eslint-disable-next-line no-restricted-exports
export default {
    forbidden: [
        ...DefaultRules,
        ...DefaultSdkRules,
        ...PublicLibraryRules,
        isolatedSubmodule("base", "src/base"),
        moduleWithDependencies("executions", "src/execution", [
            "src/base/errors/*",
            "src/base/react/*",
            "src/base/results/*",
            "src/base/vis/*",
        ]),
    ],
    options: DefaultOptions,
};
