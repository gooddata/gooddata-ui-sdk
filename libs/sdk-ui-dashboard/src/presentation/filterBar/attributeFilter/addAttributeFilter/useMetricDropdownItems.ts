// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type ICatalogMeasure,
    type IInsight,
    type ObjRef,
    areObjRefsEqual,
    insightMeasures,
    isInsightWidget,
    isLocalIdRef,
    measureItem,
} from "@gooddata/sdk-model";

type IInsightsMap = {
    get: (ref: ObjRef) => IInsight | undefined;
};

export type IMetricHeaderListItem = {
    type: "header";
    title: string;
};

export type IMetricSeparatorListItem = {
    type: "separator";
};

export type IStaticMetricListItem = IMetricHeaderListItem | IMetricSeparatorListItem;

export type IMetricDropdownListItem = ICatalogMeasure | IStaticMetricListItem;

export const isMetricHeaderListItem = (item: unknown): item is IMetricHeaderListItem => {
    return typeof item === "object" && item !== null && "type" in item && item.type === "header";
};

export const isMetricSeparatorListItem = (item: unknown): item is IMetricSeparatorListItem => {
    return typeof item === "object" && item !== null && "type" in item && item.type === "separator";
};

interface IUseMetricDropdownItemsParams {
    measures: ICatalogMeasure[];
    searchQuery: string;
    enableMeasureValueFilterKD: boolean;
    insightWidgets: unknown[];
    insightsMap: IInsightsMap;
}

export function useMetricDropdownItems({
    measures,
    searchQuery,
    enableMeasureValueFilterKD,
    insightWidgets,
    insightsMap,
}: IUseMetricDropdownItemsParams) {
    const intl = useIntl();

    const metricMeasures = useMemo(() => {
        return enableMeasureValueFilterKD ? measures : [];
    }, [enableMeasureValueFilterKD, measures]);

    const filteredMeasures = useMemo(() => {
        return searchQuery
            ? metricMeasures.filter((m) => m.measure.title.toLowerCase().includes(searchQuery.toLowerCase()))
            : metricMeasures;
    }, [metricMeasures, searchQuery]);

    const dashboardMeasureRefs = useMemo(() => {
        if (!enableMeasureValueFilterKD) {
            return [];
        }

        return insightWidgets.flatMap((widget) => {
            if (!isInsightWidget(widget)) {
                return [];
            }

            const insight = insightsMap.get(widget.insight);
            if (!insight) {
                return [];
            }

            return insightMeasures(insight)
                .map(measureItem)
                .filter((ref): ref is ObjRef => !!ref && !isLocalIdRef(ref));
        });
    }, [enableMeasureValueFilterKD, insightWidgets, insightsMap]);

    const groupedFilteredMeasures = useMemo(() => {
        const fromDashboard: ICatalogMeasure[] = [];
        const allOther: ICatalogMeasure[] = [];

        filteredMeasures.forEach((measure) => {
            const isFromDashboard = dashboardMeasureRefs.some((ref) =>
                areObjRefsEqual(ref, measure.measure.ref),
            );

            if (isFromDashboard) {
                fromDashboard.push(measure);
                return;
            }

            allOther.push(measure);
        });

        return { fromDashboard, allOther };
    }, [dashboardMeasureRefs, filteredMeasures]);

    const metricDropdownItems = useMemo((): IMetricDropdownListItem[] => {
        const { fromDashboard, allOther } = groupedFilteredMeasures;
        const hasFromDashboardMeasures = fromDashboard.length > 0;
        const hasAllOtherMeasures = allOther.length > 0;
        const items: IMetricDropdownListItem[] = [];

        if (hasFromDashboardMeasures) {
            items.push({
                type: "header",
                title: intl.formatMessage({
                    id: "dashboardMeasureValueFilter.section.from_dashboard",
                }),
            });
            items.push(...fromDashboard);
        }

        if (hasAllOtherMeasures) {
            if (hasFromDashboardMeasures) {
                items.push({ type: "separator" });
            }
            items.push({
                type: "header",
                title: intl.formatMessage({
                    id: "dashboardMeasureValueFilter.section.all_other",
                }),
            });
            items.push(...allOther);
        }

        return items;
    }, [groupedFilteredMeasures, intl]);

    return {
        metricMeasures,
        metricDropdownItems,
    };
}
