// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { useIntl } from "react-intl";

import { type IInsight } from "@gooddata/sdk-model";

import { type IDashboardInsightProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";

/**
 * @internal
 */
export function DashboardInsight(
    props: Omit<IDashboardInsightProps, "insight"> & { insight?: IInsight },
): ReactElement {
    const { insight, widget } = props;
    const intl = useIntl();

    const { InsightWidgetComponentSet, ErrorComponent } = useDashboardComponentsContext();
    const InsightComponent = useMemo(
        () => (insight ? InsightWidgetComponentSet.MainComponentProvider(insight, widget) : null),
        [InsightWidgetComponentSet, insight, widget],
    );

    if (!insight || !InsightComponent) {
        return (
            <ErrorComponent
                code="404"
                message={intl.formatMessage({ id: "widget.error.missing_insight.message" })}
                description={intl.formatMessage({ id: "widget.error.missing_insight.description" })}
            />
        );
    }

    return <InsightComponent {...props} insight={insight} />;
}
