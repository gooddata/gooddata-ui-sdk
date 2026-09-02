// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import { mergeInsightWithWidgetProperties } from "../../../../_staging/insight/insightWidgetProperties.js";

/**
 * @internal
 */
export interface IUseResolveDashboardInsightFiltersProps {
    insight: IInsight;
    widget: IInsightWidget;
}

/**
 * @internal
 */
export const useResolveDashboardInsightProperties = (
    props: IUseResolveDashboardInsightFiltersProps,
): IInsight => {
    const { widget, insight } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => mergeInsightWithWidgetProperties(insight, widget), [insight, widget.properties]);
};
