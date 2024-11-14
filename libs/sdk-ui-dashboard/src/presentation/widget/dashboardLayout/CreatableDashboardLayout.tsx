// (C) 2024 GoodData Corporation

import React from "react";
import { BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import {
    AddDashboardLayoutWidgetButton,
    DraggableDashboardLayoutCreatePanelItem,
} from "../../dragAndDrop/index.js";
import { ICreatePanelItemComponentProps } from "../../componentDefinition/index.js";

/**
 * @internal
 */
export const CreatableDashboardLayout: React.FC<ICreatePanelItemComponentProps> = (props) => {
    const { WrapCreatePanelItemWithDragComponent } = props;

    return (
        <BubbleHoverTrigger eventsOnBubble={true} className="s-add-dashboard-layout-bubble-trigger">
            <DraggableDashboardLayoutCreatePanelItem
                CreatePanelItemComponent={AddDashboardLayoutWidgetButton}
                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            />
        </BubbleHoverTrigger>
    );
};
