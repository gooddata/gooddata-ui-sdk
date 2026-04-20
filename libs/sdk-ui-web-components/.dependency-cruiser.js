// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
} from "../../common/config/dep-cruiser/default.config.js";

// eslint-disable-next-line no-restricted-exports
export default {
    // Excluding PublicLibraryRules, as we are importing CSS files to the build
    forbidden: [...DefaultRules, ...DefaultSdkRules /*, ...PublicLibraryRules*/],
    options: DefaultOptions,
};
