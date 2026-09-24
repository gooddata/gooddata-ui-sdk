// (C) 2007-2026 GoodData Corporation

import { Fragment, type ReactNode, useMemo, useState } from "react";

import cx from "classnames";
import { compact, sortBy } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import { Typography, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectSupportsRichTextWidgets } from "../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectIsAiGenerating } from "../../../model/store/config/configSelectors.js";
import { selectIsNewDashboard } from "../../../model/store/meta/metaSelectors.js";
import {
    type AttributeFilterComponentSet,
    type DashboardLayoutWidgetComponentSet,
    type InsightWidgetComponentSet,
    type RichTextWidgetComponentSet,
    type VisualizationSwitcherWidgetComponentSet,
} from "../../componentDefinition/types.js";
import {
    type DraggableContentItemType,
    type IWrapCreatePanelItemWithDragComponent,
    type IWrapInsightListItemWithDragComponent,
} from "../../dragAndDrop/types.js";

import { DraggableInsightList } from "./DraggableInsightList/DraggableInsightList.js";
import { SidebarCollapseToggle } from "./SidebarCollapseToggle.js";
import { useResizableSidebar } from "./SidebarResizeContext.js";

const RAIL_TOOLTIPS: Partial<Record<DraggableContentItemType, ReactNode>> = {
    "insight-placeholder": <FormattedMessage id="sidebar.rail.visualization" />,
    "attributeFilter-placeholder": <FormattedMessage id="addPanel.filter" />,
    dashboardLayoutListItem: <FormattedMessage id="addPanel.dashboardLayout" />,
    visualizationSwitcherListItem: <FormattedMessage id="addPanel.visualizationSwitcher" />,
    richTextListItem: <FormattedMessage id="addPanel.richText" />,
};

interface ICreationPanelProps {
    className?: string;
    WrapCreatePanelItemWithDragComponent?: IWrapCreatePanelItemWithDragComponent;
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    AttributeFilterComponentSet?: AttributeFilterComponentSet;
    InsightWidgetComponentSet?: InsightWidgetComponentSet;
    RichTextWidgetComponentSet?: RichTextWidgetComponentSet;
    VisualizationSwitcherWidgetComponentSet?: VisualizationSwitcherWidgetComponentSet;
    DashboardLayoutWidgetComponentSet?: DashboardLayoutWidgetComponentSet;
}

export function CreationPanel(props: ICreationPanelProps) {
    const { className, WrapCreatePanelItemWithDragComponent, WrapInsightListItemWithDragComponent } = props;
    const intl = useIntl();
    const supportsRichText = useDashboardSelector(selectSupportsRichTextWidgets);
    const isNewDashboard = useDashboardSelector(selectIsNewDashboard);
    const isAiGenerating = useDashboardSelector(selectIsAiGenerating);
    const { canCollapse, isCollapsed, setCollapsed } = useResizableSidebar();
    const [focusSearch, setFocusSearch] = useState<boolean | undefined>(undefined);
    const AttributeFilterComponentSet = props.AttributeFilterComponentSet!;
    const InsightWidgetComponentSet = props.InsightWidgetComponentSet!;
    const RichTextWidgetComponentSet = props.RichTextWidgetComponentSet!;
    const VisualizationSwitcherWidgetComponentSet = props.VisualizationSwitcherWidgetComponentSet!;
    const DashboardLayoutWidgetComponentSet = props.DashboardLayoutWidgetComponentSet!;

    const addItemPanelItems = useMemo(() => {
        const items = compact([
            InsightWidgetComponentSet.creating,
            AttributeFilterComponentSet.creating,
            DashboardLayoutWidgetComponentSet.creating,
            VisualizationSwitcherWidgetComponentSet.creating,
            supportsRichText && RichTextWidgetComponentSet.creating,
        ]);

        return sortBy(items, (item) => item.priority ?? 0).map(({ CreatePanelListItemComponent, type }) => {
            const listItem = (
                <CreatePanelListItemComponent
                    WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                    disabled={isAiGenerating}
                />
            );
            const tooltip = RAIL_TOOLTIPS[type];

            if (!isCollapsed || !tooltip) {
                return <Fragment key={type}>{listItem}</Fragment>;
            }

            return (
                <UiTooltip
                    key={type}
                    anchor={listItem}
                    content={tooltip}
                    arrowPlacement="left"
                    triggerBy={["hover"]}
                    optimalPlacement
                    accessibilityHidden
                />
            );
        });
    }, [
        AttributeFilterComponentSet,
        InsightWidgetComponentSet,
        RichTextWidgetComponentSet,
        VisualizationSwitcherWidgetComponentSet,
        DashboardLayoutWidgetComponentSet,
        supportsRichText,
        WrapCreatePanelItemWithDragComponent,
        isAiGenerating,
        isCollapsed,
    ]);

    return (
        <div className={cx("configuration-panel creation-panel", className)}>
            <div className="configuration-panel-content">
                <div className="gd-creation-panel-header flex-panel-item-nostretch">
                    <Typography tagName="h2">
                        <FormattedMessage id="visualizationsList.dragToAdd" />
                    </Typography>
                    {canCollapse ? (
                        <SidebarCollapseToggle
                            isCollapsed={isCollapsed}
                            onToggle={() => {
                                setFocusSearch(false);
                                setCollapsed(!isCollapsed);
                            }}
                        />
                    ) : null}
                </div>
                <div
                    className="configuration-category drag-to-add"
                    role="group"
                    aria-label={intl.formatMessage({ id: "addPanel.newItem" })}
                >
                    <div className="add-item-panel">{addItemPanelItems}</div>
                </div>
                <div
                    className="configuration-category configuration-category-vis drag-to-add flex-panel-item-stretch"
                    role="group"
                    aria-label={intl.formatMessage({ id: "visualizationsList.savedVisualizations" })}
                >
                    {canCollapse ? (
                        <div className="gd-sidebar-rail-search">
                            <UiTooltip
                                content={intl.formatMessage({ id: "sidebar.search" })}
                                arrowPlacement="left"
                                triggerBy={["hover", "focus"]}
                                optimalPlacement
                                accessibilityHidden
                                closeOnAnchorClick
                                anchor={
                                    <UiIconButton
                                        icon="search"
                                        label={intl.formatMessage({ id: "sidebar.search" })}
                                        size="medium"
                                        variant="tertiary"
                                        dataTestId="s-dashboard-sidebar-rail-search"
                                        accessibilityConfig={{
                                            ariaLabel: intl.formatMessage({ id: "sidebar.search" }),
                                        }}
                                        onClick={() => {
                                            setFocusSearch(true);
                                            setCollapsed(false);
                                        }}
                                    />
                                }
                            />
                        </div>
                    ) : null}
                    <DraggableInsightList
                        WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                        recalculateSizeReference={className}
                        searchAutofocus={!isCollapsed && (focusSearch ?? !isNewDashboard)}
                        disabled={isAiGenerating}
                    />
                </div>
            </div>
        </div>
    );
}
