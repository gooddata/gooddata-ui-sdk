// (C) 2022-2025 GoodData Corporation
import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { AddRichTextWidgetButton, DraggableRichTextCreatePanelItem } from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export function CreatableRichText({ WrapCreatePanelItemWithDragComponent }: ICreatePanelItemComponentProps) {
    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-kpi-bubble-trigger">
            <DraggableRichTextCreatePanelItem
                CreatePanelItemComponent={AddRichTextWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
}
