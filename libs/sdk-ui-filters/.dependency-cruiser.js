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
        // not-to-unresolvable and non-standard-import are replaced below: @rc-component/picker's package.json
        // exports wildcarded "./generate/*" and "./locale/*" subpaths (resolving to es/*.js or lib/*.js
        // depending on module system) that dependency-cruiser's tsConfig-based resolver doesn't expand, even
        // though both Node's runtime resolver and tsgo resolve it correctly - confirmed by direct testing.
        ...DefaultRules.filter((rule) => rule.name !== "not-to-unresolvable"),
        {
            name: "not-to-unresolvable",
            severity: "error",
            comment:
                "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
                "module: add it to your package.json. In all other cases you likely already know what to do.",
            from: {},
            to: {
                couldNotResolve: true,
                pathNot: "^@rc-component/picker/(generate|locale)/",
            },
        },
        ...DefaultSdkRules,
        ...PublicLibraryRules.filter((rule) => rule.name !== "non-standard-import"),
        {
            name: "non-standard-import",
            severity: "error",
            comment:
                "This module imports file with non-standard file extension." +
                "Import static assets to TypeScript files is not allowed.",
            from: {},
            to: {
                pathNot: ["^.*.(tsx?|jsx?|json)$", "^@rc-component/picker/(generate|locale)/"],
                dependencyTypesNot: ["core"],
            },
        },
        moduleWithDependencies("AttributeFilter", "src/AttributeFilter", ["src/constants/*", "src/shared/*"]),
        moduleWithDependencies("DateFilter", "src/DateFilter", ["src/constants/*", "src/shared/*"]),
        isolatedSubmodule("MeasureValueFilter", "src/MeasureValueFilter"),
    ],
    options: DefaultOptions,
};
