// (C) 2022-2026 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { type ICreatePanelItemComponentProps } from "../../componentDefinition/types.js";
import { AddRichTextWidgetButton } from "../../dragAndDrop/draggableWidget/AddRichTextWidgetButton.js";
import { DraggableRichTextCreatePanelItem } from "../../dragAndDrop/draggableWidget/DraggableRichTextCreatePanelItem.js";

/**
 * @internal
 */
export function CreatableRichText({ WrapCreatePanelItemWithDragComponent }: ICreatePanelItemComponentProps) {
    return (
        <BubbleHoverTrigger eventsOnBubble className="s-add-kpi-bubble-trigger">
            <DraggableRichTextCreatePanelItem
                CreatePanelItemComponent={AddRichTextWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
}
