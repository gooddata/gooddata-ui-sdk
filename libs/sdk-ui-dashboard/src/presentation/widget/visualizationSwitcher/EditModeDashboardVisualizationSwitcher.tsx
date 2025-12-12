// (C) 2024-2025 GoodData Corporation

import cx from "classnames";
import { useIntl } from "react-intl";

import { insightVisualizationType } from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";
import { IconVisualizationSwitcher, Typography } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { AllVisualizationsDashInsights } from "./AllVisualizationsDashInsights.js";
import { type IDashboardVisualizationSwitcherProps } from "./types.js";
import { useExecutionProgress } from "./useExecutionProgress.js";
import { selectInsightsMap, useDashboardSelector } from "../../../model/index.js";
import {
    DashboardItem,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentation/presentationComponents/index.js";
import { EditableDashboardInsightWidgetHeader } from "../widget/InsightWidget/EditableDashboardInsightWidgetHeader.js";

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

    const { showOthers } = useExecutionProgress();

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
