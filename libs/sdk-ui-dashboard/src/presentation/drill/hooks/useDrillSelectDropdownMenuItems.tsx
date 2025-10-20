// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { defineMessages, useIntl } from "react-intl";

import { IUiMenuItem } from "@gooddata/sdk-ui-kit";

import { DashboardDrillDefinition } from "../../../types.js";
import { DrillSelectItem, DrillType } from "../DrillSelect/types.js";

const groupMenuItemMessages = defineMessages({
    drillDown: { id: "drill_modal_picker.drill-down" },
    drillInto: { id: "drill_modal_picker.drill-into" },
    crossFilter: { id: "drill_modal_picker.cross-filter" },
    keyDriverAnalysis: { id: "drill_modal_picker.key-driver-analysis" },
});

export interface IDrillSelectDropdownMenuItemData {
    interactive: {
        type: DrillType;
        name: string;
        drillDefinition: DashboardDrillDefinition;
        context?: unknown;
        attributeValue?: string | null;
        onSelect: () => void;
    };
}

export type IMenuInteractiveItem = IUiMenuItem<IDrillSelectDropdownMenuItemData>;

export const useDrillSelectDropdownMenuItems = ({
    drillDownItems,
    drillItems,
    crossFilteringItems,
    keyDriverAnalysisItems,
    onSelect,
}: {
    drillDownItems: DrillSelectItem[];
    drillItems: DrillSelectItem[];
    crossFilteringItems: DrillSelectItem[];
    keyDriverAnalysisItems: DrillSelectItem[];
    onSelect: (item: DashboardDrillDefinition, context: unknown) => void;
}): IMenuInteractiveItem[] => {
    const { formatMessage } = useIntl();

    return useMemo<IMenuInteractiveItem[]>(() => {
        const createMenuGroup = (
            items: DrillSelectItem[],
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
                stringTitle: item.name,
                data: {
                    type: item.type,
                    name: item.name,
                    attributeValue: item.attributeValue,
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
        ];
    }, [drillDownItems, drillItems, crossFilteringItems, keyDriverAnalysisItems, formatMessage, onSelect]);
};
