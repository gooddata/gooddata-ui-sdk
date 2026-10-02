// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IInsight } from "@gooddata/sdk-model";

import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { useVisualizationExportData } from "../../export/useExportData.js";

import { type IDashboardInsightProps } from "./types.js";

/**
 * @internal
 */
export function DashboardInsight(
    props: Omit<IDashboardInsightProps, "insight"> & { insight?: IInsight },
): ReactElement {
    const { insight, widget, exportData } = props;
    const intl = useIntl();

    const { InsightWidgetComponentSet, ErrorComponent } = useDashboardComponentsContext();
    const InsightComponent = useMemo(
        () => (insight ? InsightWidgetComponentSet.MainComponentProvider(insight, widget) : null),
        [InsightWidgetComponentSet, insight, widget],
    );

    const exportDataVis = useVisualizationExportData(exportData, false, true);

    if (!insight || !InsightComponent) {
        const error = (
            <ErrorComponent
                code="404"
                message={intl.formatMessage({ id: "widget.error.missing_insight.message" })}
                description={intl.formatMessage({ id: "widget.error.missing_insight.description" })}
            />
        );

        // slides export waits for every widget's content element and fails the whole export after
        // its 180 s timeout when one is missing
        return exportData && exportDataVis ? (
            <div className="visualization-content" {...exportDataVis}>
                {error}
            </div>
        ) : (
            error
        );
    }

    return <InsightComponent {...props} insight={insight} />;
}
