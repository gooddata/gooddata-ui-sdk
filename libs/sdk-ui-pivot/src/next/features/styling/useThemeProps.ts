// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { themeBalham, iconOverrides } from "ag-grid-enterprise";
import { getAscSortIcon, getDescSortIcon, getMenuIcon } from "./icons.js";
import { AgGridProps } from "../../types/agGrid.js";

export const useThemeProps = (): ((agGridReactProps: AgGridProps) => AgGridProps) => {
    const gdTheme = useTheme();

    return useCallback(
        (agGridReactProps: AgGridProps) => {
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
                },
            });

            const agTheme = themeBalham.withPart(icons);

            return { ...agGridReactProps, theme: agTheme };
        },
        [gdTheme],
    );
};
