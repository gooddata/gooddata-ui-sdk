// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { iconOverrides, themeBalham } from "ag-grid-enterprise";

import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import {
    getAscSortIcon,
    getDescSortIcon,
    getMenuIcon,
    getPaginationNextIcon,
    getPaginationPreviousIcon,
} from "../features/styling/icons.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with our theming applied.
 *
 * @internal
 */
export const useThemeProps = (): ((agGridReactProps: AgGridProps) => AgGridProps) => {
    const gdTheme = useTheme();

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            if (agGridReactProps.theme) {
                throw new UnexpectedSdkError("theme is already set");
            }
            const iconColor = gdTheme?.palette?.complementary?.c8 || "#464E56";

            const icons = iconOverrides({
                type: "image",
                mask: true,
                icons: {
                    asc: {
                        svg: getAscSortIcon(iconColor),
                    },
                    desc: {
                        svg: getDescSortIcon(iconColor),
                    },
                    "menu-alt": {
                        svg: getMenuIcon(iconColor),
                    },
                    previous: {
                        svg: getPaginationPreviousIcon(),
                    },
                    next: {
                        svg: getPaginationNextIcon(),
                    },
                },
            });

            const agTheme = themeBalham.withPart(icons);

            return { ...agGridReactProps, theme: agTheme };
        },
        [gdTheme],
    );
};
