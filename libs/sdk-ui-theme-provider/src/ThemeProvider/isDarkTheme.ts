// (C) 2025 GoodData Corporation

import { getLuminance } from "polished";

import { ITheme } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const isDarkTheme = (theme: ITheme | undefined): boolean => {
    const firstColor = theme?.palette?.complementary?.c0;
    const lastColor = theme?.palette?.complementary?.c9;

    if (!firstColor || !lastColor) {
        return false;
    }

    return getLuminance(firstColor) < getLuminance(lastColor);
};
