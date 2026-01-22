// (C) 2024-2026 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { type ICreatePanelItemComponentProps } from "../../componentDefinition/types.js";
import { AddVisualizationSwitcherWidgetButton } from "../../dragAndDrop/draggableWidget/AddVisualizationSwitcherWidgetButton.js";
import { DraggableVisualizationSwitcherCreatePanelItem } from "../../dragAndDrop/draggableWidget/DraggableVisualizationSwitcherCreatePanelItem.js";

/**
 * @internal
 */
export function CreatableVisualizationSwitcher({
    WrapCreatePanelItemWithDragComponent,
}: ICreatePanelItemComponentProps) {
    return (
        <BubbleHoverTrigger eventsOnBubble className="s-add-visualization-switcher-bubble-trigger">
            <DraggableVisualizationSwitcherCreatePanelItem
                CreatePanelItemComponent={AddVisualizationSwitcherWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
}
