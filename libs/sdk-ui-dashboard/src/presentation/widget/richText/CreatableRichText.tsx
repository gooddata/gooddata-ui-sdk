// (C) 2022-2024 GoodData Corporation
import React from "react";
import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { AddRichTextWidgetButton, DraggableRichTextCreatePanelItem } from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const CreatableRichText: React.FC<ICreatePanelItemComponentProps> = (props) => {
    const { WrapCreatePanelItemWithDragComponent } = props;

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-kpi-bubble-trigger">
            <DraggableRichTextCreatePanelItem
                CreatePanelItemComponent={AddRichTextWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
};
