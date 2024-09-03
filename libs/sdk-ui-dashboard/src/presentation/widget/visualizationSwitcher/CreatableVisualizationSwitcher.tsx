// (C) 2024 GoodData Corporation

import React from "react";
import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    AddVisualizationSwitcherWidgetButton,
    DraggableVisualizationSwitcherCreatePanelItem,
} from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const CreatableVisualizationSwitcher: React.FC<ICreatePanelItemComponentProps> = (props) => {
    const { WrapCreatePanelItemWithDragComponent } = props;

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-visualization-switcher-bubble-trigger">
            <DraggableVisualizationSwitcherCreatePanelItem
                CreatePanelItemComponent={AddVisualizationSwitcherWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
};
