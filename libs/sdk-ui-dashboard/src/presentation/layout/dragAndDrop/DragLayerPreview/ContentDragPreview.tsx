// (C) 2022-2025 GoodData Corporation
import React, { FC, useMemo } from "react";
import { XYCoord } from "react-dnd";

import { DraggableContentItem, DraggableContentItemType } from "../../../dragAndDrop/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { DEBUG_SHOW_DROP_ZONES } from "../../../dragAndDrop/debug.js";
import { DragPreviewProps } from "../../../dragAndDrop/DragLayerPreview/types.js";

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

    const {
        AttributeFilterComponentSet,
        InsightWidgetComponentSet,
        DateFilterComponentSet,
        RichTextWidgetComponentSet,
        VisualizationSwitcherWidgetComponentSet,
        DashboardLayoutWidgetComponentSet,
    } = useDashboardComponentsContext();
    const previewComponentsMap = useMemo<Partial<Record<DraggableContentItemType, any>>>(
        () => ({
            attributeFilter: AttributeFilterComponentSet.dragging.DraggingComponent,
            dateFilter: DateFilterComponentSet.dragging.DraggingComponent,
            insight: InsightWidgetComponentSet.dragging.DraggingComponent,
            richText: RichTextWidgetComponentSet.dragging.DraggingComponent,
            visualizationSwitcher: VisualizationSwitcherWidgetComponentSet.dragging.DraggingComponent,
            dashboardLayout: DashboardLayoutWidgetComponentSet.dragging.DraggingComponent,
        }),
        [
            AttributeFilterComponentSet.dragging.DraggingComponent,
            InsightWidgetComponentSet.dragging.DraggingComponent,
            DateFilterComponentSet.dragging.DraggingComponent,
            RichTextWidgetComponentSet.dragging.DraggingComponent,
            VisualizationSwitcherWidgetComponentSet.dragging.DraggingComponent,
            DashboardLayoutWidgetComponentSet.dragging.DraggingComponent,
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
