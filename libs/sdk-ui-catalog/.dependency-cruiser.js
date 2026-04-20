// (C) 2025-2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
    PublicLibraryRules,
} from "../../common/config/dep-cruiser/default.config.js";

// eslint-disable-next-line no-restricted-exports
export default {
    forbidden: [...DefaultRules, ...DefaultSdkRules, ...PublicLibraryRules],
    options: DefaultOptions,
};
