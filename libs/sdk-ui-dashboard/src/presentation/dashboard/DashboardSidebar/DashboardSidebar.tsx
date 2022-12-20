// (C) 2022 GoodData Corporation
import React from "react";
import { useDashboardComponentsContext } from "../../dashboardContexts";

import { ISidebarProps } from "./types";

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
    } = useDashboardComponentsContext();

    return (
        <SidebarComponent
            {...props}
            KpiWidgetComponentSet={KpiWidgetComponentSet}
            AttributeFilterComponentSet={AttributeFilterComponentSet}
            InsightWidgetComponentSet={InsightWidgetComponentSet}
            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
            WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
            DeleteDropZoneComponent={DeleteDropZoneComponent}
        />
    );
};
