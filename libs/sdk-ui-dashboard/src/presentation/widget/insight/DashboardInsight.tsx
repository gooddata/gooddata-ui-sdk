// (C) 2020-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import { useIntl } from "react-intl";

import { IInsight } from "@gooddata/sdk-model";

import { IDashboardInsightProps } from "./types.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

/**
 * @internal
 */
export const DashboardInsight = (
    props: Omit<IDashboardInsightProps, "insight"> & { insight?: IInsight },
): ReactElement => {
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
};
