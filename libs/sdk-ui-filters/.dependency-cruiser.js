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
        moduleWithDependencies("AttributeFilter", "src/AttributeFilter", ["src/constants/*", "src/shared/*"]),
        moduleWithDependencies("DateFilter", "src/DateFilter", ["src/constants/*", "src/shared/*"]),
        isolatedSubmodule("MeasureValueFilter", "src/MeasureValueFilter"),
    ],
    options: DefaultOptions,
};
