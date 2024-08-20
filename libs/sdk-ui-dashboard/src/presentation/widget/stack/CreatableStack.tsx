// (C) 2024 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { AddStackWidgetButton, DraggableStackCreatePanelItem } from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const CreatableStack: React.FC<ICreatePanelItemComponentProps> = (props) => {
    const { WrapCreatePanelItemWithDragComponent } = props;

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-stack-bubble-trigger">
            <DraggableStackCreatePanelItem
                CreatePanelItemComponent={AddStackWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
};
