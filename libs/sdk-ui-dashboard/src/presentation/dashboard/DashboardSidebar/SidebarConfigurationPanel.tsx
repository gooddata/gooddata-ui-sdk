// (C) 2022-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";

import { CreationPanel } from "./CreationPanel.js";
import { DashboardSidebarChrome } from "./DashboardSidebarChrome.js";
import { FloatingToolbar } from "./FloatingToolbar.js";
import { type ISidebarProps } from "./types.js";
import { useResizableSidebar } from "./useResizableSidebarState.js";

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
    const sidebar = useResizableSidebar();

    if (enableEnhancedInsightPicker) {
        return <FloatingToolbar />;
    }

    return (
        <DashboardSidebarChrome
            sidebar={sidebar}
            hasResizeHandle={enableDashboardSidebarResize}
            onContainerClick={deselectWidgets}
            afterPanel={<DeleteDropZoneComponent />}
        >
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
        </DashboardSidebarChrome>
    );
}
