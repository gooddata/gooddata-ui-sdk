// (C) 2025 GoodData Corporation
import React from "react";
import {
    DefaultUiMenuInteractiveItem,
    Icon,
    IUiMenuInteractiveItemProps,
    IUiMenuItem,
    separatorStaticItem,
} from "@gooddata/sdk-ui-kit";
import { TotalType } from "@gooddata/sdk-model";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { IAggregationsMenuItem, IAggregationsMenuTotalItem } from "../../types/menu.js";
import { e } from "../../features/styling/bem.js";

/**
 * Mapping of total types to their display titles.
 */
export const TOTAL_TYPE_TITLES: Record<TotalType, string> = {
    sum: "Sum",
    max: "Max",
    min: "Min",
    avg: "Avg",
    med: "Median",
    nat: "Rollup (Total)",
};

function TopMenuHeader() {
    return (
        <div className={e("header-cell-menu-section-header")}>
            <span>Aggregate</span>
        </div>
    );
}

function SubMenuSectionHeader({ variant }: { variant: "rows" | "columns" }) {
    const theme = useTheme();

    const icon =
        variant === "rows" ? (
            <Icon.Rows
                width={12}
                height={11}
                colorPalette={{
                    normalRow: theme?.palette?.complementary?.c7,
                    totalRow: theme?.palette?.complementary?.c4,
                }}
            />
        ) : (
            <Icon.Columns
                width={12}
                height={11}
                colorPalette={{
                    normalColumn: theme?.palette?.complementary?.c7,
                    totalColumn: theme?.palette?.complementary?.c4,
                }}
            />
        );

    return (
        <div className={e("header-cell-submenu-section-header")}>
            <div className={e("header-cell-submenu-section-icon")}>{icon}</div>
            <span>{variant === "rows" ? "Rows" : "Columns"}</span>
        </div>
    );
}

export type AggregationsMenuItemData = {
    interactive: IAggregationsMenuTotalItem | null;
    static: React.ReactNode;
};

export const SmallInteractiveItem: React.FC<IUiMenuInteractiveItemProps<AggregationsMenuItemData>> = (
    props,
) => <DefaultUiMenuInteractiveItem<AggregationsMenuItemData> {...props} size="small" />;

export function buildUiMenuItems(
    items: IAggregationsMenuItem[],
): Array<IUiMenuItem<AggregationsMenuItemData>> {
    const uiItems: Array<IUiMenuItem<AggregationsMenuItemData>> = [];

    // Top header label styled like section headers
    uiItems.push({ type: "static", id: "header", data: <TopMenuHeader /> });

    items.forEach((item) => {
        const isAnyItemActive = [...item.rows, ...item.columns].some((i) => i.isActive);
        const hasRows = item.rows.length > 0;
        const hasColumns = item.columns.length > 0;

        const subItems: Array<IUiMenuItem<AggregationsMenuItemData>> = [];

        if (hasRows) {
            subItems.push({
                type: "static",
                id: `${item.type}-rows-header`,
                data: <SubMenuSectionHeader variant="rows" />,
            });

            item.rows.forEach((rowItem) => {
                subItems.push({
                    type: "interactive",
                    id: rowItem.key,
                    stringTitle: rowItem.title,
                    isSelected: rowItem.isActive,
                    data: rowItem,
                });
            });
        }

        if (hasRows && hasColumns) {
            // Use a single shared separator for consistent visuals
            subItems.push(separatorStaticItem);
        }

        if (hasColumns) {
            subItems.push({
                type: "static",
                id: `${item.type}-columns-header`,
                data: <SubMenuSectionHeader variant="columns" />,
            });

            item.columns.forEach((colItem) => {
                subItems.push({
                    type: "interactive",
                    id: colItem.key,
                    stringTitle: colItem.title,
                    isSelected: colItem.isActive,
                    data: colItem,
                });
            });
        }

        uiItems.push({
            type: "interactive",
            id: String(item.type),
            stringTitle: TOTAL_TYPE_TITLES[item.type],
            isSelected: isAnyItemActive,
            data: null, // container for submenu, do not trigger onItemClick on select
            subItems,
        });
    });

    return uiItems;
}
