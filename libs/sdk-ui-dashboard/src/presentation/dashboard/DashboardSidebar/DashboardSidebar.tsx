// (C) 2022-2025 GoodData Corporation

import { type ReactElement } from "react";

import { type ISidebarProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

export function DashboardSidebar(props: ISidebarProps): ReactElement {
    const {
        WrapCreatePanelItemWithDragComponent,
        WrapInsightListItemWithDragComponent,
        DeleteDropZoneComponent,
    } = props;
    const {
        SidebarComponent,
        AttributeFilterComponentSet,
        InsightWidgetComponentSet,
        RichTextWidgetComponentSet,
        VisualizationSwitcherWidgetComponentSet,
        DashboardLayoutWidgetComponentSet,
    } = useDashboardComponentsContext();

    return (
        <SidebarComponent
            {...props}
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
}
