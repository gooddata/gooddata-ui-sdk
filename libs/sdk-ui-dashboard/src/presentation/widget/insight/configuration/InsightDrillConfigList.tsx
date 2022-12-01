// (C) 2019-2022 GoodData Corporation
import React from "react";
import InsightDrillConfigItem from "./InsightDrillConfigItem";
import { IDrillConfigItem } from "../../../drill/types";
import { IDrillTargetType } from "./useDrillTargetTypeItems";
import { InsightDrillDefinition } from "@gooddata/sdk-model";
import { ScrollableItem } from "@gooddata/sdk-ui-kit";

export interface IDrillConfigListProps {
    drillConfigItems?: IDrillConfigItem[];
    onDelete: (item: IDrillConfigItem) => void;
    onSetup: (drill: InsightDrillDefinition, changedItem: IDrillConfigItem) => void;
    onIncompleteChange: (changedItem: IDrillConfigItem) => void;
    enabledDrillTargetTypeItems: IDrillTargetType[];
}

export const InsightDrillConfigList: React.FunctionComponent<IDrillConfigListProps> = (props) => {
    const { drillConfigItems = [] } = props;

    const shouldScrollToContainer = (item: IDrillConfigItem, isLast: boolean): boolean => {
        return !item.complete && isLast;
    };

    const isLast = (index: number) => {
        return index === drillConfigItems.length - 1;
    };

    const renderItem = (item: IDrillConfigItem) => (
        <InsightDrillConfigItem
            item={item}
            key={item.localIdentifier + item.drillTargetType}
            onDelete={props.onDelete}
            onSetup={props.onSetup}
            onIncompleteChange={props.onIncompleteChange}
            enabledDrillTargetTypeItems={props.enabledDrillTargetTypeItems}
        />
    );

    return (
        <div className="s-drill-config-list">
            {drillConfigItems.map((item, index) => {
                if (shouldScrollToContainer(item, isLast(index))) {
                    return (
                        <ScrollableItem
                            scrollIntoView={true}
                            key={item.localIdentifier + item.drillTargetType}
                        >
                            {renderItem(item)}
                        </ScrollableItem>
                    );
                }
                return renderItem(item);
            })}
        </div>
    );
};
