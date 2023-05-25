// (C) 2022 GoodData Corporation
import React from "react";

import { KPI_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";

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
export const DraggableKpiCreatePanelItem: React.FC<IDraggableKpiCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
    disabled,
}) => {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            disabled={disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
