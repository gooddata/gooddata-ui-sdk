// (C) 2022 GoodData Corporation
import React from "react";
import invariant from "ts-invariant";

import { CustomDashboardWidgetComponent } from "../../widget/types";
import {
    selectLayout,
    selectSettings,
    selectWidgetCoordinatesByRef,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model";
import { useDashboardDrop } from "../useDashboardDrop";
import { WidgetDropZoneBox } from "./WidgetDropZoneBox";
import { isPlaceholderWidget } from "../../../widgets";
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

    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const coords = useDashboardSelector(selectWidgetCoordinatesByRef(widget.ref));
    const layout = useDashboardSelector(selectLayout);

    const isLastInSection = coords.itemIndex === layout.sections[coords.sectionIndex]?.items.length - 1;

    const handleInsightListItemDrop = useInsightListItemDropHandler();
    const handleInsightPlaceholderDrop = useInsightPlaceholderDropHandler();
    const handleKpiPlaceholderDrop = useKpiPlaceholderDropHandler();

    const [, dropRef] = useDashboardDrop(
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
        },
        [
            dispatch,
            settings,
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
