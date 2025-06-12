// (C) 2022-2024 GoodData Corporation
import React from "react";

import {
    RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
} from "@gooddata/sdk-ui-ext";
import { CustomCreatePanelItemComponent } from "../../componentDefinition/index.js";
import { DraggableCreatePanelItem } from "../DraggableCreatePanelItem.js";
import { DraggableItem, IWrapCreatePanelItemWithDragComponent } from "../types.js";
import { useDashboardSelector, selectSettings, useWidgetSelection } from "../../../model/index.js";
import { ISettings } from "@gooddata/sdk-model";

/**
 * @internal
 */
interface IDraggableRichTextCreatePanelItemProps {
    CreatePanelItemComponent: CustomCreatePanelItemComponent;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
}

const getDragItem = (settings: ISettings): DraggableItem => {
    return {
        type: "richTextListItem",
        size: {
            gridHeight: RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.height.default,
            gridWidth: settings.enableDashboardFlexibleLayout
                ? RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT.width.default
                : RICH_TEXT_WIDGET_SIZE_INFO_DEFAULT.width.default,
        },
    };
};

/**
 * @internal
 */
export const DraggableRichTextCreatePanelItem: React.FC<IDraggableRichTextCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    WrapCreatePanelItemWithDragComponent,
}) => {
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
