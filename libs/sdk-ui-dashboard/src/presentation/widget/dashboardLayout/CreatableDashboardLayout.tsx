// (C) 2024-2025 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    AddDashboardLayoutWidgetButton,
    DraggableDashboardLayoutCreatePanelItem,
} from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export function CreatableDashboardLayout({
    WrapCreatePanelItemWithDragComponent,
}: ICreatePanelItemComponentProps) {
    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-dashboard-layout-bubble-trigger">
            <DraggableDashboardLayoutCreatePanelItem
                CreatePanelItemComponent={AddDashboardLayoutWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
}
