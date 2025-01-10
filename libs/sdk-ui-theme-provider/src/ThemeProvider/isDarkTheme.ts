// (C) 2025 GoodData Corporation
import { ITheme } from "@gooddata/sdk-model";
import { getLuminance } from "polished";

/**
 * @internal
 */
export const isDarkTheme = (theme: ITheme): boolean => {
    const firstColor = theme?.palette?.complementary?.c0;
    const lastColor = theme?.palette?.complementary?.c9;

    if (!firstColor || !lastColor) {
        return false;
    }

    return getLuminance(firstColor) < getLuminance(lastColor);
};
