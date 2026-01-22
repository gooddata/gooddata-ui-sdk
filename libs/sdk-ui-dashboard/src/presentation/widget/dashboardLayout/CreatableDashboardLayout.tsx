// (C) 2024-2026 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { type ICreatePanelItemComponentProps } from "../../componentDefinition/types.js";
import { AddDashboardLayoutWidgetButton } from "../../dragAndDrop/draggableWidget/AddDashboardLayoutWidgetButton.js";
import { DraggableDashboardLayoutCreatePanelItem } from "../../dragAndDrop/draggableWidget/DraggableDashboardLayoutCreatePanelItem.js";

/**
 * @internal
 */
export function CreatableDashboardLayout({
    WrapCreatePanelItemWithDragComponent,
}: ICreatePanelItemComponentProps) {
    return (
        <BubbleHoverTrigger eventsOnBubble className="s-add-dashboard-layout-bubble-trigger">
            <DraggableDashboardLayoutCreatePanelItem
                CreatePanelItemComponent={AddDashboardLayoutWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
}
