// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { compact } from "lodash-es";
import { defineMessages, useIntl } from "react-intl";

import { type IUiMenuItem, type IconType, UiIcon } from "@gooddata/sdk-ui-kit";

import { type DashboardDrillDefinition } from "../../../types.js";
import { DrillType, type IDrillSelectItem } from "../DrillSelect/types.js";

const groupMenuItemMessages = defineMessages({
    drillDown: { id: "drill_modal_picker.drill-down" },
    drillInto: { id: "drill_modal_picker.drill-into" },
    crossFilter: { id: "drill_modal_picker.cross-filter" },
    keyDriverAnalysis: { id: "drill_modal_picker.key-driver-analysis" },
    drillToUrl: { id: "drill_modal_picker.drill-to-url" },
});

const DRILL_ICON_NAME: Record<DrillType, IconType> = {
    [DrillType.DRILL_TO_DASHBOARD]: "drillTo",
    [DrillType.DRILL_TO_INSIGHT]: "drillTo",
    [DrillType.DRILL_TO_URL]: "link",
    [DrillType.DRILL_DOWN]: "trendDown",
    [DrillType.CROSS_FILTERING]: "filter",
    [DrillType.KEY_DRIVER_ANALYSIS]: "explainai",
};

function getMenuItemStringTitle(item: IDrillSelectItem): string {
    return compact([item.name, item.attributeValue ? `(${item.attributeValue})` : null]).join(" ");
}

export interface IDrillSelectDropdownMenuItemData {
    interactive: {
        type: DrillType;
        drillDefinition: DashboardDrillDefinition;
        onSelect: () => void;
    };
}

export type IMenuInteractiveItem = IUiMenuItem<IDrillSelectDropdownMenuItemData>;

export const useDrillSelectDropdownMenuItems = ({
    drillDownItems,
    drillItems,
    crossFilteringItems,
    keyDriverAnalysisItems,
    drillToUrlItems,
    onSelect,
}: {
    drillDownItems: IDrillSelectItem[];
    drillItems: IDrillSelectItem[];
    crossFilteringItems: IDrillSelectItem[];
    keyDriverAnalysisItems: IDrillSelectItem[];
    drillToUrlItems: IDrillSelectItem[];
    onSelect: (item: DashboardDrillDefinition, context: unknown) => void;
}): IMenuInteractiveItem[] => {
    const { formatMessage } = useIntl();

    return useMemo<IMenuInteractiveItem[]>(() => {
        const createMenuGroup = (
            items: IDrillSelectItem[],
            groupId: string,
            groupTitle: string,
        ): IMenuInteractiveItem => ({
            type: "group" as const,
            id: groupId,
            stringTitle: formatMessage({ id: groupTitle }),
            data: `${groupTitle} Data`,
            subItems: items.map((item, index) => ({
                type: "interactive" as const,
                id: `${groupId}-${index}`,
                stringTitle: getMenuItemStringTitle(item),
                iconLeft: <UiIcon type={DRILL_ICON_NAME[item.type]} size={16} color="complementary-5" />,
                isDisabled: item.isDisabled,
                tooltip: item.tooltipText,
                ariaAttributes: {
                    "aria-haspopup":
                        item.type === DrillType.DRILL_TO_INSIGHT || item.type === DrillType.DRILL_DOWN
                            ? "dialog"
                            : undefined,
                },
                data: {
                    type: item.type,
                    drillDefinition: item.drillDefinition,
                    onSelect: () => {
                        onSelect(item.drillDefinition, item.context);
                    },
                },
            })),
        });

        const drillDownMenuItems =
            drillDownItems.length > 0
                ? [createMenuGroup(drillDownItems, "drill-down", groupMenuItemMessages.drillDown.id)]
                : [];

        const drillToUrlMenuItems =
            drillToUrlItems.length > 0
                ? [createMenuGroup(drillToUrlItems, "drill-to-url", groupMenuItemMessages.drillToUrl.id)]
                : [];

        const drillMenuItems =
            drillItems.length > 0
                ? [createMenuGroup(drillItems, "drill-into", groupMenuItemMessages.drillInto.id)]
                : [];

        const crossFilteringMenuItems =
            crossFilteringItems.length > 0
                ? [createMenuGroup(crossFilteringItems, "cross-filter", groupMenuItemMessages.crossFilter.id)]
                : [];

        const keyDriverAnalysisMenu =
            keyDriverAnalysisItems.length > 0
                ? [
                      createMenuGroup(
                          keyDriverAnalysisItems,
                          "key-driver-analysis",
                          groupMenuItemMessages.keyDriverAnalysis.id,
                      ),
                  ]
                : [];

        return [
            ...drillDownMenuItems,
            ...drillMenuItems,
            ...crossFilteringMenuItems,
            ...keyDriverAnalysisMenu,
            ...drillToUrlMenuItems,
        ];
    }, [
        drillDownItems,
        drillItems,
        crossFilteringItems,
        keyDriverAnalysisItems,
        drillToUrlItems,
        formatMessage,
        onSelect,
    ]);
};
