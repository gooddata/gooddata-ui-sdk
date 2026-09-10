// (C) 2022-2026 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";

import { CreationPanel } from "./CreationPanel.js";
import { FloatingToolbar } from "./FloatingToolbar.js";
import { SidebarCollapseToggle } from "./SidebarCollapseToggle.js";
import { SidebarResizeChrome } from "./SidebarResizeChrome.js";
import { useResizableSidebar } from "./SidebarResizeContext.js";
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
    const { isCollapsed, canCollapse, setCollapsed, expandedWidth } = useResizableSidebar();

    if (enableEnhancedInsightPicker) {
        return <FloatingToolbar />;
    }

    const content = (
        <>
            {canCollapse ? (
                <div className="gd-sidebar-rail">
                    <SidebarCollapseToggle
                        isCollapsed={isCollapsed}
                        onToggle={() => setCollapsed(!isCollapsed)}
                    />
                </div>
            ) : null}
            <div className={cx("gd-sidebar-panel", { "gd-sidebar-panel--collapsible": canCollapse })}>
                <div
                    className="flex-panel-full-height"
                    style={canCollapse ? { width: expandedWidth } : undefined}
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
                </div>
            </div>
            <DeleteDropZoneComponent />
        </>
    );

    if (enableDashboardSidebarResize) {
        return <SidebarResizeChrome onContainerClick={deselectWidgets}>{content}</SidebarResizeChrome>;
    }

    return (
        <div
            className={cx("col gd-flex-item gd-sidebar-container", {
                "gd-sidebar-container--collapsed": isCollapsed,
            })}
            onClick={deselectWidgets}
        >
            {content}
        </div>
    );
}
