// (C) 2024-2025 GoodData Corporation

import { DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import { useWidgetSelection } from "../../../model/index.js";
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
export function DraggableDashboardLayoutCreatePanelItem({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
}: IDraggableDashboardLayoutCreatePanelItemProps) {
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
