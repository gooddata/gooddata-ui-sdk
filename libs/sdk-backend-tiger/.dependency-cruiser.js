// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
    PublicLibraryRules,
    moduleWithDependencies,
} from "../../common/config/dep-cruiser/default.config.js";

export default {
    forbidden: [
        ...DefaultRules,
        ...DefaultSdkRules,
        ...PublicLibraryRules,
        moduleWithDependencies("convertors", "src/convertors", ["src/types/*", "src/utils/*"]),
    ],
    options: DefaultOptions,
};
