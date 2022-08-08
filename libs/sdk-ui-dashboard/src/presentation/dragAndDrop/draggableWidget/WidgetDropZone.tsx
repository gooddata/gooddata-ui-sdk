// (C) 2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";

import { CustomDashboardWidgetComponent } from "../../widget/types";
import { selectSettings, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { WidgetDropZoneBox } from "./WidgetDropZoneBox";
import { isPlaceholderWidget } from "../../../widgets/placeholders/types";
import { isInsightDraggableListItem, isKpiPlaceholderDraggableItem } from "../types";
import { useKpiPlaceholderDropHandler } from "./useKpiPlaceholderDropHandler";
import { useInsightPlaceholderDropHandler } from "./useInsightPlaceholderDropHandler";

export const WidgetDropZone: CustomDashboardWidgetComponent = (props) => {
    const { widget } = props;
    invariant(isPlaceholderWidget(widget));

    const { sectionIndex, itemIndex, isLastInSection } = widget;

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

    const [, dropRef] = useDashboardDrop(
        ["insightListItem", "kpi-placeholder"],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightPlaceholderDrop(sectionIndex, itemIndex, item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop(sectionIndex, itemIndex);
                }
            },
        },
        [dispatch, settings, sectionIndex, itemIndex, handleKpiPlaceholderDrop],
    );

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} />
        </div>
    );
};
