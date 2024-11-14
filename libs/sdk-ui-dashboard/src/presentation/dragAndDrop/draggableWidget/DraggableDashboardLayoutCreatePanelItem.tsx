// (C) 2024 GoodData Corporation

import React from "react";
import { DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
interface IDraggableDashboardLayoutCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
}

const getDragItem = (): DraggableItem => {
    return {
        type: "dashboardLayoutListItem",
        size: {
            gridHeight: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.height.default,
            gridWidth: DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT.width.default,
        },
    };
};

/**
 * @internal
 */
export const DraggableDashboardLayoutCreatePanelItem: React.FC<
    IDraggableDashboardLayoutCreatePanelItemProps
> = ({ CreatePanelItemComponent, WrapCreatePanelItemWithDragComponent }) => {
    const dragItem = getDragItem();
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
