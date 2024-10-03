// (C) 2020-2024 GoodData Corporation
import React, { useMemo } from "react";

import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { IDashboardInsightProps } from "./types.js";
import { IInsight } from "@gooddata/sdk-model";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export const DashboardInsight = (
    props: Omit<IDashboardInsightProps, "insight"> & { insight?: IInsight },
): JSX.Element => {
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
