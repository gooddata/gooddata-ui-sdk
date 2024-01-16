// (C) 2022-2024 GoodData Corporation
import React from "react";

import { KPI_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
interface IDraggableRichTextCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    // disabled?: boolean;
}

const dragItem: DraggableItem = {
    type: "richText-placeholder",
    size: {
        gridHeight: KPI_WIDGET_SIZE_INFO_DEFAULT.height.default, // TODO RICH-TEXT
        gridWidth: KPI_WIDGET_SIZE_INFO_DEFAULT.width.default, // TODO RICH-TEXT
    },
};

/**
 * @internal
 */
export const DraggableRichTextCreatePanelItem: React.FC<IDraggableRichTextCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
    // disabled,
}) => {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            // disabled={disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
