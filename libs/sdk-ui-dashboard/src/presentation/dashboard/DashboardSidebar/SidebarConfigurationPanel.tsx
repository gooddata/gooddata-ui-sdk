// (C) 2022-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";

import { CreationPanel } from "./CreationPanel.js";
import { FloatingToolbar } from "./FloatingToolbar.js";
import { SidebarResizeChrome } from "./SidebarResizeChrome.js";
import { type ISidebarProps } from "./types.js";

/**
 * @internal
 */
export function SidebarConfigurationPanel(props: Omit<ISidebarProps, "DefaultSidebar">): ReactElement | null {
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
    const settings = useDashboardSelector(selectSettings);
    const enableEnhancedInsightPicker = settings?.enableEnhancedInsightPicker ?? false;
    const enableDashboardSidebarResize = settings?.enableDashboardSidebarResize ?? false;

    if (enableEnhancedInsightPicker) {
        return <FloatingToolbar />;
    }

    const content = (
        <>
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
        </>
    );

    if (enableDashboardSidebarResize) {
        return <SidebarResizeChrome onContainerClick={deselectWidgets}>{content}</SidebarResizeChrome>;
    }

    return (
        <div className="col gd-flex-item gd-sidebar-container" onClick={deselectWidgets}>
            {content}
        </div>
    );
}
