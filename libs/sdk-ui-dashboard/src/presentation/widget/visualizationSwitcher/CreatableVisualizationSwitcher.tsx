// (C) 2024-2025 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";
import {
    AddVisualizationSwitcherWidgetButton,
    DraggableVisualizationSwitcherCreatePanelItem,
} from "../../dragAndDrop/index.js";

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
