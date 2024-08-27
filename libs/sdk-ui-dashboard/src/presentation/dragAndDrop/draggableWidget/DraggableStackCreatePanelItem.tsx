// (C) 2022-2024 GoodData Corporation
import React from "react";

import { STACK_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
interface IDraggableStackCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
}

const dragItem: DraggableItem = {
    type: "stackListItem",
    size: {
        gridHeight: STACK_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: STACK_WIDGET_SIZE_INFO_DEFAULT.width.default,
    },
};

/**
 * @internal
 */
export const DraggableStackCreatePanelItem: React.FC<IDraggableStackCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
}) => {
    console.log("STACK", STACK_WIDGET_SIZE_INFO_DEFAULT);
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
