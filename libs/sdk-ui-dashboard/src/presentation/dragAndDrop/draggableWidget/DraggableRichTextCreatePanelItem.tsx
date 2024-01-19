// (C) 2022-2024 GoodData Corporation
import React from "react";

import { RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
interface IDraggableRichTextCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
}

const dragItem: DraggableItem = {
    type: "richTextListItem",
    size: {
        gridHeight: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.width.default,
    },
};

/**
 * @internal
 */
export const DraggableRichTextCreatePanelItem: React.FC<IDraggableRichTextCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
}) => {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
