// (C) 2026 GoodData Corporation

import { type UserConfig } from "vite";

/**
 * `quietDeps` silences Sass deprecation warnings raised inside stylesheets reached through importers
 * (e.g. ag-grid-community's global-builtin usage pulled in via sdk-ui-pivot). The root stylesheet
 * still warns.
 */
export const CSS_QUIET_DEPS: NonNullable<UserConfig["css"]> = {
    preprocessorOptions: {
        scss: {
            quietDeps: true,
        },
    },
};
