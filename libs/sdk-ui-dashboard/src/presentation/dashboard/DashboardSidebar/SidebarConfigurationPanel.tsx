// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

import { CreationPanel } from "./CreationPanel.js";
import { ISidebarProps } from "./types.js";
import { useWidgetSelection } from "../../../model/index.js";

/**
 * @internal
 */
export function SidebarConfigurationPanel(props: Omit<ISidebarProps, "DefaultSidebar">): ReactElement {
    const {
        configurationPanelClassName,
        WrapCreatePanelItemWithDragComponent,
        WrapInsightListItemWithDragComponent,
        AttributeFilterComponentSet,
        InsightWidgetComponentSet,
        RichTextWidgetComponentSet,
        VisualizationSwitcherWidgetComponentSet,
        DashboardLayoutWidgetComponentSet,
    } = props;
    const { deselectWidgets } = useWidgetSelection();
    const DeleteDropZoneComponent = props.DeleteDropZoneComponent!;

    return (
        <div className="col gd-flex-item gd-sidebar-container" onClick={deselectWidgets}>
            <div className="flex-panel-full-height">
                <CreationPanel
                    className={configurationPanelClassName}
                    WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                    WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                    AttributeFilterComponentSet={AttributeFilterComponentSet}
                    InsightWidgetComponentSet={InsightWidgetComponentSet}
                    RichTextWidgetComponentSet={RichTextWidgetComponentSet}
                    VisualizationSwitcherWidgetComponentSet={VisualizationSwitcherWidgetComponentSet}
                    DashboardLayoutWidgetComponentSet={DashboardLayoutWidgetComponentSet}
                />
            </div>
            <DeleteDropZoneComponent />
        </div>
    );
}
