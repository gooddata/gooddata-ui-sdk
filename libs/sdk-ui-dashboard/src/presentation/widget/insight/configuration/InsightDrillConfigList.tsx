// (C) 2019-2022 GoodData Corporation
import React from "react";
import InsightDrillConfigItem from "./InsightDrillConfigItem.js";
import { IDrillConfigItem } from "../../../drill/types.js";
import { useDrillTargetTypeItems } from "./useDrillTargetTypeItems.js";
import { InsightDrillDefinition } from "@gooddata/sdk-model";
import { ScrollableItem } from "@gooddata/sdk-ui-kit";

export interface IDrillConfigListProps {
    drillConfigItems?: IDrillConfigItem[];
    onDelete: (item: IDrillConfigItem) => void;
    onSetup: (drill: InsightDrillDefinition, changedItem: IDrillConfigItem) => void;
    onIncompleteChange: (changedItem: IDrillConfigItem) => void;
}

export const InsightDrillConfigList: React.FunctionComponent<IDrillConfigListProps> = (props) => {
    const { drillConfigItems = [], onDelete, onSetup, onIncompleteChange } = props;
    const enabledDrillTargetTypeItems = useDrillTargetTypeItems();

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
};
