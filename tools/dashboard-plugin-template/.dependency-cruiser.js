// (C) 2026 GoodData Corporation

import {
    DefaultOptions,
    DefaultRules,
    DefaultSdkRules,
} from "../../common/config/dep-cruiser/default.config.js";

export default {
    forbidden: [...DefaultRules, ...DefaultSdkRules],
    options: DefaultOptions,
};
