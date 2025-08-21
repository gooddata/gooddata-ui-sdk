// (C) 2019-2025 GoodData Corporation
import React from "react";

import { InsightDrillDefinition } from "@gooddata/sdk-model";
import { ScrollableItem } from "@gooddata/sdk-ui-kit";

import InsightDrillConfigItem from "./InsightDrillConfigItem.js";
import { useDrillTargetTypeItems } from "./useDrillTargetTypeItems.js";
import { IDrillConfigItem, IDrillDownAttributeHierarchyDefinition } from "../../../drill/types.js";

export interface IDrillConfigListProps {
    drillConfigItems?: IDrillConfigItem[];
    onDelete: (item: IDrillConfigItem) => void;
    onSetup: (
        drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
        changedItem: IDrillConfigItem,
    ) => void;
    onIncompleteChange: (changedItem: IDrillConfigItem) => void;
    disableDrillDown?: boolean;
}

export function InsightDrillConfigList(props: IDrillConfigListProps) {
    const { drillConfigItems = [], disableDrillDown, onDelete, onSetup, onIncompleteChange } = props;
    const enabledDrillTargetTypeItems = useDrillTargetTypeItems(disableDrillDown);

    const shouldScrollToContainer = (item: IDrillConfigItem, isLast: boolean): boolean => {
        return !item.complete && isLast;
    };

    const isLast = (index: number) => {
        return index === drillConfigItems.length - 1;
    };

    return (
        <div className="s-drill-config-list">
            {drillConfigItems.map((item, index) => {
                const shouldScroll = shouldScrollToContainer(item, isLast(index));
                return (
                    <ScrollableItem
                        scrollIntoView={shouldScroll}
                        key={item.localIdentifier + item.drillTargetType}
                    >
                        <InsightDrillConfigItem
                            item={item}
                            key={item.localIdentifier + item.drillTargetType}
                            onDelete={onDelete}
                            onSetup={onSetup}
                            onIncompleteChange={onIncompleteChange}
                            enabledDrillTargetTypeItems={enabledDrillTargetTypeItems}
                        />
                    </ScrollableItem>
                );
            })}
        </div>
    );
}
