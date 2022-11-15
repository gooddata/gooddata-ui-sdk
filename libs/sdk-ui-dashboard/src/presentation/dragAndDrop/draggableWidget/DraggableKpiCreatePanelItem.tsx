// (C) 2022 GoodData Corporation
import React from "react";

import { KPI_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { CustomCreatePanelItemComponent } from "../../componentDefinition";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem";
import { DraggableItem } from "../types";

interface IDraggableKpiCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    disabled?: boolean;
}

const dragItem: DraggableItem = {
    type: "kpi-placeholder",
    size: {
        gridHeight: KPI_WIDGET_SIZE_INFO_DEFAULT.height.default,
        gridWidth: KPI_WIDGET_SIZE_INFO_DEFAULT.width.default,
    },
};

export const DraggableKpiCreatePanelItem: React.FC<IDraggableKpiCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    disabled,
}) => {
    return (
        <DraggableCreatePanelItem
            Component={CreatePanelItemComponent}
            disabled={disabled}
            dragItem={dragItem}
            hideDefaultPreview={false}
        />
    );
};
