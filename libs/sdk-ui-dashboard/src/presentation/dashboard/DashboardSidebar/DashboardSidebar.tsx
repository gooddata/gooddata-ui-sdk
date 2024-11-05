// (C) 2022-2024 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

import { ISidebarProps } from "./types.js";

export const DashboardSidebar = (props: ISidebarProps): JSX.Element => {
    const {
        WrapCreatePanelItemWithDragComponent,
        WrapInsightListItemWithDragComponent,
        DeleteDropZoneComponent,
    } = props;
    const {
        SidebarComponent,
        KpiWidgetComponentSet,
        AttributeFilterComponentSet,
        InsightWidgetComponentSet,
        RichTextWidgetComponentSet,
        VisualizationSwitcherWidgetComponentSet,
        DashboardLayoutWidgetComponentSet,
    } = useDashboardComponentsContext();

    return (
        <SidebarComponent
            {...props}
            KpiWidgetComponentSet={KpiWidgetComponentSet}
            AttributeFilterComponentSet={AttributeFilterComponentSet}
            InsightWidgetComponentSet={InsightWidgetComponentSet}
            RichTextWidgetComponentSet={RichTextWidgetComponentSet}
            VisualizationSwitcherWidgetComponentSet={VisualizationSwitcherWidgetComponentSet}
            DashboardLayoutWidgetComponentSet={DashboardLayoutWidgetComponentSet}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
            DeleteDropZoneComponent={DeleteDropZoneComponent}
        />
    );
};
