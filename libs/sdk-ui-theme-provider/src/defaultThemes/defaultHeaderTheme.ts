// (C) 2026 GoodData Corporation

import { type IThemeHeader } from "@gooddata/sdk-model";

/**
 * Default application header colors.
 *
 * @remarks
 * These values match the built-in AppHeader SCSS defaults (black background, white text,
 * GoodData highlight blue for the active accent).
 *
 * @beta
 */
export const defaultHeaderTheme: IThemeHeader = {
    backgroundColor: "#000",
    color: "#fff",
    activeColor: "#14b2e2",
};
