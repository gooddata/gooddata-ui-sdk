// (C) 2022-2025 GoodData Corporation

import {
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
} from "@gooddata/sdk-ui-ext";

import { useWidgetSelection } from "../../../model/index.js";
import { type CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { type DraggableItem, type IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
interface IDraggableRichTextCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
}

const getDragItem = (): DraggableItem => {
    return {
        type: "richTextListItem",
        size: {
            gridHeight: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.height.default,
            gridWidth: RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default,
        },
    };
};

/**
 * @internal
 */
export function DraggableRichTextCreatePanelItem({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
}: IDraggableRichTextCreatePanelItemProps) {
    const dragItem = getDragItem();

    const { deselectWidgets } = useWidgetSelection();

    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            dragItem={dragItem}
            hideDefaultPreview={false}
            onDragStart={() => deselectWidgets()}
        />
    );
}
