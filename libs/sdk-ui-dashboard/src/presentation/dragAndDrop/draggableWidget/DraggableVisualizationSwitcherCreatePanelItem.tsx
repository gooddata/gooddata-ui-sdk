// (C) 2024 GoodData Corporation

import React from "react";
import {
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
} from "@gooddata/sdk-ui-ext";

import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";
import { useDashboardSelector, selectSettings, useWidgetSelection } from "../../../model/index.js";
import { ISettings } from "@gooddata/sdk-model";

/**
 * @internal
 */
interface IDraggableVisualizationSwitcherCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
}

const getDragItem = (settings: ISettings): DraggableItem => {
    return {
        type: "visualizationSwitcherListItem",
        size: {
            gridHeight: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT.height.default,
            gridWidth: settings.enableDashboardFlexibleLayout
                ? VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default
                : VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT.width.default,
        },
    };
};

/**
 * @internal
 */
export const DraggableVisualizationSwitcherCreatePanelItem: React.FC<
    IDraggableVisualizationSwitcherCreatePanelItemProps
> = ({ CreatePanelItemComponent, WrapCreatePanelItemWithDragComponent }) => {
    const settings = useDashboardSelector(selectSettings);
    const dragItem = getDragItem(settings);

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
};
