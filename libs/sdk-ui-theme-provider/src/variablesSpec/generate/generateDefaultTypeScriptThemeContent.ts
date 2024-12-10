// (C) 2024 GoodData Corporation
import { allThemeCssVariables } from "../allThemeCssVariables.js";
import set from "lodash/set.js";

/**
 * Generates default TypeScript theme file content.
 *
 * @internal
 */
export function generateDefaultTypeScriptThemeContent() {
    const theme = {};
    allThemeCssVariables.forEach((v) => {
        if (v.type === "theme" && !v.isNotTypedByTheme) {
            const value = v.defaultThemeValue ?? v.defaultValue;
            if (value !== null) {
                set(theme, v.themePath, value);
            }
        }
    });

    // Format theme as json, but remove quotes from keys
    const formattedTheme = JSON.stringify(theme, null, 4).replace(/"([^"]+)":/g, "$1:");

    return `// (C) 2024 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";

export const indigoTheme: ITheme = ${formattedTheme};

`;
}
