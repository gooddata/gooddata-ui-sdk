// (C) 2022-2026 GoodData Corporation

import { KPI_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import { type CustomCreatePanelItemComponent } from "../../componentDefinition/types.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { type DraggableItem, type IWrapCreatePanelItemWithDragComponent } from "../types.js";

/**
 * @internal
 */
interface IDraggableKpiCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    disabled?: boolean;
}

const dragItem: DraggableItem = {
    type: "kpi-placeholder",
    size: {
        gridHeight: KPI_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: KPI_WIDGET_SIZE_INFO_DEFAULT.width.default,
    },
};

/**
 * @internal
 */
export function DraggableKpiCreatePanelItem({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
    disabled,
}: IDraggableKpiCreatePanelItemProps) {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            disabled={disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
}
