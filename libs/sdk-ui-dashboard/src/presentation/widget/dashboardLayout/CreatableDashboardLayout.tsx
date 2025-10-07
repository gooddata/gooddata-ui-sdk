// (C) 2024-2025 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";
import {
    AddDashboardLayoutWidgetButton,
    DraggableDashboardLayoutCreatePanelItem,
} from "../../dragAndDrop/index.js";

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
