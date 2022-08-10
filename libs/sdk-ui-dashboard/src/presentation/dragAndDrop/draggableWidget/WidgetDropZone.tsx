// (C) 2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";

import { CustomDashboardWidgetComponent } from "../../widget/types";
import { selectSettings, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { WidgetDropZoneBox } from "./WidgetDropZoneBox";
import { isPlaceholderWidget } from "../../../widgets/placeholders/types";
import {
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../types";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";
import { useInsightListItemDropHandler } from "./useInsightListItemDropHandler";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler";

export const WidgetDropZone: CustomDashboardWidgetComponent = (props) => {
    const { widget } = props;
    invariant(isPlaceholderWidget(widget));

    const { sectionIndex, itemIndex, isLastInSection } = widget;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const handleInsightListItemDrop = useInsightListItemDropHandler();
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

    const [, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder", "insight-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(sectionIndex, itemIndex, item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop(sectionIndex, itemIndex);
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop(sectionIndex, itemIndex);
                }
            },
        },
        [
            dispatch,
            settings,
            sectionIndex,
            itemIndex,
            handleInsightListItemDrop,
            handleInsightPlaceholderDrop,
            handleKpiPlaceholderDrop,
        ],
    );

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} />
        </div>
    );
};
