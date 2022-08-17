// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { EmptyDashboardDropZoneBox } from "./EmptyDashboardDropZoneBox";
import { useDashboardDrop } from "../useDashboardDrop";
import {
    DraggableItemType,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../types";
import {
    useDashboardDispatch,
    useDashboardSelector,
    selectWidgetPlaceholder,
    eagerRemoveSectionItem,
} from "../../../model";
import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler";
import { useNewSectionKpiPlaceholderDropHandler } from "./useNewSectionKpiPlaceholderDropHandler";

const widgetCategoryMapping: Partial<{ [D in DraggableItemType]: string }> = {
    "insight-placeholder": "insight",
    insightListItem: "visualization",
    "kpi-placeholder": "kpi",
};

export const EmptyDashboardDropZone: React.FC = () => {
    const dispatch = useDashboardDispatch();
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(0);
    const handleKpiPlaceholderDrop = useNewSectionKpiPlaceholderDropHandler(0);
    const handleInsightPlaceholderDrop = useNewSectionInsightPlaceholderDropHandler(0);

    const [{ canDrop, isOver, itemType }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop();
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }
            },
            hover: () => {
                if (widgetPlaceholder) {
                    dispatch(
                        eagerRemoveSectionItem(widgetPlaceholder.sectionIndex, widgetPlaceholder.itemIndex),
                    );
                }
            },
        },
        [
            dispatch,
            widgetPlaceholder,
            handleInsightListItemDrop,
            handleKpiPlaceholderDrop,
            handleInsightPlaceholderDrop,
        ],
    );

    const widgetCategory = widgetCategoryMapping[itemType];

    return (
        <div
            className={cx("drag-info-placeholder", "s-last-drop-position", "dash-item", {
                [`type-${widgetCategory}`]: !!widgetCategory,
                "type-none": !widgetCategory,
            })}
            ref={dropRef}
        >
            <div className={cx("drag-info-placeholder-inner", { "can-drop": canDrop, "is-over": isOver })}>
                <EmptyDashboardDropZoneBox />
            </div>
        </div>
    );
};
