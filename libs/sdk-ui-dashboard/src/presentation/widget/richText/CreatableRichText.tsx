// (C) 2022-2025 GoodData Corporation

import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";
import { AddRichTextWidgetButton, DraggableRichTextCreatePanelItem } from "../../dragAndDrop/index.js";

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
