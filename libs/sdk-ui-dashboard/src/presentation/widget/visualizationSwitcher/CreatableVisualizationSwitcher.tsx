// (C) 2024-2025 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    AddVisualizationSwitcherWidgetButton,
    DraggableVisualizationSwitcherCreatePanelItem,
} from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export function CreatableVisualizationSwitcher({
    WrapCreatePanelItemWithDragComponent,
}: ICreatePanelItemComponentProps) {
    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-visualization-switcher-bubble-trigger">
            <DraggableVisualizationSwitcherCreatePanelItem
                CreatePanelItemComponent={AddVisualizationSwitcherWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
}
