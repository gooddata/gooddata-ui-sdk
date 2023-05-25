// (C) 2022-2023 GoodData Corporation
import React, { FC, useMemo } from "react";
import { XYCoord } from "react-dnd";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

import { DEBUG_SHOW_DROP_ZONES } from "../debug.js";
import { DraggableContentItem, DraggableContentItemType } from "../types.js";
import { DragPreviewProps } from "./types.js";

function getItemStyles(initialOffset: XYCoord | null, clientOffset: XYCoord | null) {
    if (!initialOffset || !clientOffset) {
        return {
            display: "none",
        };
    }

    const { x, y } = clientOffset;

    const transform = `translate(${x}px, ${y}px)`;
    return {
        transform,
        WebkitTransform: transform,
    };
}

export const ContentDragPreview: FC<DragPreviewProps<DraggableContentItem>> = (props) => {
    const { itemType, item, initialOffset, clientOffset } = props;

    const { AttributeFilterComponentSet, InsightWidgetComponentSet, KpiWidgetComponentSet } =
        useDashboardComponentsContext();
    const previewComponentsMap = useMemo<Partial<Record<DraggableContentItemType, any>>>(
        () => ({
            attributeFilter: AttributeFilterComponentSet.dragging.DraggingComponent,
            insight: InsightWidgetComponentSet.dragging.DraggingComponent,
            kpi: KpiWidgetComponentSet.dragging.DraggingComponent,
        }),
        [
            AttributeFilterComponentSet.dragging.DraggingComponent,
            InsightWidgetComponentSet.dragging.DraggingComponent,
            KpiWidgetComponentSet.dragging.DraggingComponent,
        ],
    );

    const component = useMemo(() => {
        if (!(itemType in previewComponentsMap)) {
            if (DEBUG_SHOW_DROP_ZONES) {
                console.warn(`DND: dnd item ${itemType} not handled by CustomDragLayer`);
            }
            return null;
        }

        const Component = previewComponentsMap[itemType as DraggableContentItemType];
        return <Component itemType={itemType} item={item} />;
    }, [itemType, previewComponentsMap, item]);

    return (
        <div className="drag-preview" style={getItemStyles(initialOffset, clientOffset)}>
            {component}
        </div>
    );
};
