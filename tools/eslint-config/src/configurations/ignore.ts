// (C) 2025 GoodData Corporation

import type { IDualConfiguration } from "../types.js";

const commonConfiguration = { ignorePatterns: ["**/dist/**/*.*", "**/esm/**/*.*"] };

export const ignore: IDualConfiguration = {
    v8: commonConfiguration,
    v9: commonConfiguration,
};
