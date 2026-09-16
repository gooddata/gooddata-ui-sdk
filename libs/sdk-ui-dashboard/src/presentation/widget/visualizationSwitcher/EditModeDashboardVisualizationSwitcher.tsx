// (C) 2024-2026 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { insightVisualizationType } from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";
import { IconVisualizationSwitcher, Typography, UiIcon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectInsightsMap } from "../../../model/store/insights/insightsSelectors.js";
import { selectRestrictedInsightsMap } from "../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { DashboardItem } from "../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemHeadline } from "../../presentationComponents/DashboardItems/DashboardItemHeadline.js";
import { DashboardItemVisualization } from "../../presentationComponents/DashboardItems/DashboardItemVisualization.js";
import { getVisTypeCssClass } from "../../presentationComponents/DashboardItems/utils.js";
import { EditableDashboardInsightWidgetHeader } from "../widget/InsightWidget/EditableDashboardInsightWidgetHeader.js";

import { AllVisualizationsDashInsights } from "./AllVisualizationsDashInsights.js";
import { type IDashboardVisualizationSwitcherProps } from "./types.js";
import { useExecutionProgress } from "./useExecutionProgress.js";

/**
 * @internal
 */
export function EditModeDashboardVisualizationSwitcher({
    widget,
    activeVisualizationId,
    onError,
    onExportReady,
    onLoadingChanged,
    screen,
}: IDashboardVisualizationSwitcherProps) {
    const activeVisualization =
        widget.visualizations.find((visualization) => visualization.identifier === activeVisualizationId) ??
        widget.visualizations[0];

    const theme = useTheme();
    const intl = useIntl();
    const emptyContentIconColor = theme?.palette?.complementary?.c7 ?? "#6D7680";

    const insights = useDashboardSelector(selectInsightsMap);
    const insight = activeVisualization ? insights.get(activeVisualization.insight) : undefined;
    const restrictedInsights = useDashboardSelector(selectRestrictedInsightsMap);
    const { RestrictedPlaceholderComponentProvider } = useDashboardComponentsContext();

    const { showOthers } = useExecutionProgress();

    // a restricted insight is withheld from the map, so this has to be decided before the branch
    // below, which would otherwise offer to add visualizations to a switcher that already has some
    if (activeVisualization && restrictedInsights.has(activeVisualization.insight)) {
        const Content = RestrictedPlaceholderComponentProvider(activeVisualization);

        return (
            <DashboardItem
                className="type-visualization gd-dashboard-view-widget is-edit-mode"
                screen={screen}
            >
                <DashboardItemVisualization
                    // the same label the closed title carries in view mode, so the tile does not
                    // change shape between the modes; static, because a title the editor cannot read
                    // is not one they can rename
                    renderHeadline={(clientHeight) => (
                        <div className="gd-visualization-switcher-widget-header-title">
                            <UiIcon type="lock" size={14} color="complementary-7" />
                            <DashboardItemHeadline
                                clientHeight={clientHeight}
                                title={intl.formatMessage({ id: "visualizationSwitcher.restrictedEntry" })}
                            />
                        </div>
                    )}
                >
                    {({ clientHeight, clientWidth }) => (
                        <div className="visualization-content">
                            <Content width={clientWidth} height={clientHeight} />
                        </div>
                    )}
                </DashboardItemVisualization>
            </DashboardItem>
        );
    }

    if (!activeVisualization || !insight) {
        return (
            <div className="gd-visualization-switcher-widget-empty-content">
                <IconVisualizationSwitcher width={32} height={38} color={emptyContentIconColor} />
                <Typography tagName="p">
                    {intl.formatMessage({ id: "visualizationSwitcher.emptyContent" })}
                </Typography>
            </div>
        );
    } else {
        const visType = insightVisualizationType(insight) as VisType;

        return (
            <DashboardItem
                className={cx(
                    "type-visualization",
                    "gd-dashboard-view-widget",
                    "is-edit-mode",
                    getVisTypeCssClass(activeVisualization.type, visType),
                )}
                screen={screen}
            >
                <DashboardItemVisualization
                    renderHeadline={(clientHeight) =>
                        !activeVisualization.configuration?.hideTitle && (
                            <EditableDashboardInsightWidgetHeader
                                clientHeight={clientHeight}
                                widget={activeVisualization}
                                insight={insight}
                            />
                        )
                    }
                >
                    {({ clientHeight, clientWidth }) => (
                        <AllVisualizationsDashInsights
                            visualizationClassName="is-edit-mode"
                            clientHeight={clientHeight}
                            clientWidth={clientWidth}
                            visualizations={widget.visualizations}
                            showOthers={showOthers}
                            activeVisualization={activeVisualization}
                            onExportReady={onExportReady}
                            onLoadingChanged={onLoadingChanged}
                            onError={onError}
                        />
                    )}
                </DashboardItemVisualization>
            </DashboardItem>
        );
    }
}
