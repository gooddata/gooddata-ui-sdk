// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { type IntlShape, useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    DefaultUiMenuInteractiveItem,
    type IUiMenuInteractiveItemProps,
    type IUiMenuItem,
    IconColumns,
    IconRows,
    separatorStaticItem,
} from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { messages, totalTypeMessages } from "../../../../locales.js";
import { e } from "../../../features/styling/bem.js";
import {
    type IAggregationsMenuItem,
    type IAggregationsSubMenuItem,
    type ISortingMenuItem,
    type ITextWrappingMenuItem,
} from "../../../types/menu.js";

function TopMenuHeader() {
    const intl = useIntl();
    return (
        <div className={e("header-cell-menu-section-header")}>
            <span>{intl.formatMessage(messages["aggregationsSection"])}</span>
        </div>
    );
}

function SubMenuSectionHeader({ variant }: { variant: "rows" | "columns" }) {
    const intl = useIntl();
    const theme = useTheme();

    const icon =
        variant === "rows" ? (
            <IconRows
                width={12}
                height={11}
                colorPalette={{
                    normalRow: theme?.palette?.complementary?.c7,
                    totalRow: theme?.palette?.complementary?.c4,
                }}
            />
        ) : (
            <IconColumns
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
            <span>
                {variant === "rows"
                    ? intl.formatMessage(messages["rowsSection"])
                    : intl.formatMessage(messages["columnsSection"])}
            </span>
        </div>
    );
}

type DisabledItemData = { type: "disabledItem"; disabledTooltip?: string };

export type AggregationsMenuItemData = {
    static: ReactNode;
    interactive:
        | IAggregationsSubMenuItem
        | ITextWrappingMenuItem
        | ISortingMenuItem
        | DisabledItemData
        | null;
};

export function HeaderInteractiveItem(props: IUiMenuInteractiveItemProps<AggregationsMenuItemData>) {
    const { item } = props;

    if (item.data && item.data.type === "disabledItem" && item.data.disabledTooltip) {
        return (
            <BubbleHoverTrigger showDelay={0} hideDelay={0} eventsOnBubble>
                <DefaultUiMenuInteractiveItem<AggregationsMenuItemData> {...props} />
                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                    {item.data.disabledTooltip}
                </Bubble>
            </BubbleHoverTrigger>
        );
    }

    return <DefaultUiMenuInteractiveItem<AggregationsMenuItemData> {...props} />;
}

/**
 * Builds UI menu items for aggregation functionality.
 *
 * @param aggregationsItems - The aggregation menu items to build from
 * @returns Array of UI menu items for aggregations
 */
function buildUiAggregationMenuItems(
    aggregationsItems: IAggregationsMenuItem[],
    intl: IntlShape,
): Array<IUiMenuItem<AggregationsMenuItemData>> {
    const uiItems: Array<IUiMenuItem<AggregationsMenuItemData>> = [];
    let hasAnyAggregationItem = false;

    aggregationsItems.forEach((item) => {
        const hasRows = item.rows.length > 0;
        const hasColumns = item.columns.length > 0;
        const hasAny = hasRows || hasColumns;
        if (!hasAny) {
            return;
        }
        if (!hasAnyAggregationItem) {
            uiItems.push({ type: "static", id: "aggregations-header", data: <TopMenuHeader /> });
            hasAnyAggregationItem = true;
        }

        const isAnyItemActive = [...item.rows, ...item.columns].some((i) => i.isActive);

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
                    id: rowItem.id,
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
                    id: colItem.id,
                    stringTitle: colItem.title,
                    isSelected: colItem.isActive,
                    data: colItem,
                });
            });
        }

        uiItems.push({
            type: "interactive",
            id: String(item.type),
            stringTitle: intl.formatMessage(totalTypeMessages[item.type]),
            isSelected: isAnyItemActive,
            isDisabled: item.isDisabled,
            data: item.disabledTooltip
                ? { type: "disabledItem", disabledTooltip: item.disabledTooltip }
                : null, // container for submenu, do not trigger onItemClick on select
            subItems,
        });
    });

    return uiItems;
}

/**
 * Builds UI menu items for text wrapping functionality.
 *
 * @param textWrappingItems - The text wrapping menu items to build from
 * @returns Array of UI menu items for text wrapping
 */
function buildUiTextWrappingMenuItems(
    textWrappingItems: ITextWrappingMenuItem[],
    intl: IntlShape,
): Array<IUiMenuItem<AggregationsMenuItemData>> {
    const uiItems: Array<IUiMenuItem<AggregationsMenuItemData>> = [];

    if (textWrappingItems.length > 0) {
        uiItems.push({
            type: "static",
            id: "text-wrapping-header",
            data: (
                <div className={e("header-cell-menu-section-header")}>
                    <span>{intl.formatMessage(messages["textWrappingSection"])}</span>
                </div>
            ),
        });

        textWrappingItems.forEach((wrapItem) => {
            uiItems.push({
                type: "interactive",
                id: wrapItem.id,
                stringTitle: wrapItem.title,
                isSelected: wrapItem.isActive,
                data: wrapItem,
                iconRight: wrapItem.isActive ? <i className="gd-icon-checkmark" /> : null,
            });
        });
    }

    return uiItems;
}

/**
 * Builds UI menu items for sorting functionality.
 *
 * @param sortingItems - The sorting menu items to build from
 * @returns Array of UI menu items for sorting
 */
function buildUiSortingMenuItems(
    sortingItems: ISortingMenuItem[],
    intl: IntlShape,
): Array<IUiMenuItem<AggregationsMenuItemData>> {
    const uiItems: Array<IUiMenuItem<AggregationsMenuItemData>> = [];

    if (sortingItems.length > 0) {
        uiItems.push({
            type: "static",
            id: "sort-header",
            data: (
                <div className={e("header-cell-menu-section-header")}>
                    <span>{intl.formatMessage(messages["sortSection"])}</span>
                </div>
            ),
        });

        sortingItems.forEach((sortItem) => {
            uiItems.push({
                type: "interactive",
                id: `sort-${sortItem.id}`,
                stringTitle: sortItem.title,
                isSelected: sortItem.isActive,
                data: sortItem,
                iconRight: sortItem.isActive ? <i className="gd-icon-checkmark" /> : null,
            });
        });
    }

    return uiItems;
}

/**
 * Builds complete UI menu items by combining sorting, aggregation and text wrapping items.
 *
 * @param aggregationsItems - The aggregation menu items
 * @param textWrappingItems - The text wrapping menu items
 * @param sortingItems - The sorting menu items
 * @returns Complete array of UI menu items
 */
export function buildUiMenuItems(
    aggregationsItems: IAggregationsMenuItem[],
    textWrappingItems: ITextWrappingMenuItem[],
    sortingItems: ISortingMenuItem[],
    intl: IntlShape,
): Array<IUiMenuItem<AggregationsMenuItemData>> {
    return [
        ...buildUiSortingMenuItems(sortingItems, intl),
        ...buildUiAggregationMenuItems(aggregationsItems, intl),
        ...buildUiTextWrappingMenuItems(textWrappingItems, intl),
    ];
}
