// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { Typography } from "@gooddata/sdk-ui-kit";

import { EmptyDashboardDropZoneBox } from "./EmptyDashboardDropZoneBox";
import { useDashboardDrop } from "../useDashboardDrop";
import {
    DraggableItemType,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../types";
import { useDashboardDispatch, useDashboardSelector, selectWidgetPlaceholder } from "../../../model";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";

const widgetCategoryMapping: Partial<{ [D in DraggableItemType]: string }> = {
    "insight-placeholder": "insight",
    insightListItem: "visualization",
    "kpi-placeholder": "kpi",
};

export const EmptyDashboardDropZone: React.FC = () => {
    const dispatch = useDashboardDispatch();
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const handleInsightListItemDrop = useInsightListItemDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();

    const [{ canDrop, isOver, itemType }, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop(0, 0, true);
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop(0, 0, true);
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

    const message = <FormattedMessage id="newDashboard.dropInsight" />;
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
                <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <Typography tagName="p" className="drop-target-message kpi-drop-target">
                            {message}
                        </Typography>
                        <Typography tagName="p" className="drop-target-message visualization-drop-target">
                            {message}
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
};
