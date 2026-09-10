// (C) 2019-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type InsightDrillDefinition } from "@gooddata/sdk-model";
import { ScrollableItem } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import { type IDrillConfigItem, type IDrillDownAttributeHierarchyDefinition } from "../../../drill/types.js";

import { DrillConfigItem } from "./InsightDrillConfigItem.js";
import { useDrillTargetTypeItems } from "./useDrillTargetTypeItems.js";

export interface IDrillConfigListProps {
    drillConfigItems?: IDrillConfigItem[];
    onDelete: (item: IDrillConfigItem) => void;
    onSetup: (
        drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
        changedItem: IDrillConfigItem,
    ) => void;
    onIncompleteChange: (changedItem: IDrillConfigItem) => void;
    disableDrillDown?: boolean;
    /**
     * Local identifiers of insight attributes that are computed attributes. Drill down is not
     * available for them - a computed attribute cannot be part of an attribute hierarchy.
     */
    computedAttributeOriginLocalIds?: string[];
}

export function InsightDrillConfigList({
    drillConfigItems = [],
    disableDrillDown,
    computedAttributeOriginLocalIds = [],
    onDelete,
    onSetup,
    onIncompleteChange,
}: IDrillConfigListProps) {
    const intl = useIntl();
    const enabledDrillTargetTypeItems = useDrillTargetTypeItems(disableDrillDown);
    const computedAttributeDrillTargetTypeItems = useDrillTargetTypeItems(
        true,
        intl.formatMessage(messages.computedAttributeDrillDownToolTip),
    );

    const getDrillTargetTypeItems = (item: IDrillConfigItem) => {
        return item.type === "attribute" &&
            computedAttributeOriginLocalIds.includes(item.originLocalIdentifier)
            ? computedAttributeDrillTargetTypeItems
            : enabledDrillTargetTypeItems;
    };

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
                        <DrillConfigItem
                            item={item}
                            key={item.localIdentifier + item.drillTargetType}
                            onDelete={onDelete}
                            onSetup={onSetup}
                            onIncompleteChange={onIncompleteChange}
                            enabledDrillTargetTypeItems={getDrillTargetTypeItems(item)}
                        />
                    </ScrollableItem>
                );
            })}
        </div>
    );
}
