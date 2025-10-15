// (C) 2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import {
    ICatalogDateDataset,
    IInsightWidget,
    IRichTextWidget,
    idRef,
    isAbsoluteDateFilter,
    isObjRef,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByRichTextWidget } from "../../converters/index.js";
import {
    InsightDateDatasets,
    QueryInsightDateDatasets,
    insightSelectDateDataset,
    queryDateDatasetsForInsight,
    selectFilterContextFilters,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../model/index.js";

export function useRichTextFilters(widget: IRichTextWidget | IInsightWidget | false) {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const {
        run: queryDateDatasets,
        result,
        status,
    } = useDashboardQueryProcessing<
        QueryInsightDateDatasets,
        InsightDateDatasets,
        Parameters<typeof queryDateDatasetsForInsight>
    >({
        queryCreator: queryDateDatasetsForInsight,
    });

    useEffect(() => {
        if (!widget) {
            queryDateDatasets();
        }
    }, [queryDateDatasets, widget]);

    return useMemo(() => {
        let currentWidget: IRichTextWidget | IInsightWidget;

        // If there is no widget, we need to add default date dataset filter
        if (widget === false) {
            const dateDataset = result ? insightSelectDateDataset(result) : undefined;
            currentWidget = createTempRichText(dateDataset);
        } else {
            currentWidget = widget;
        }

        //NOTE: This needs to be rework in future into query to be able used ignored filters
        // and other stuff similar to insight widget, this is basically simple select related
        // filters
        let filters = filterContextItemsToDashboardFiltersByRichTextWidget(dashboardFilters, currentWidget);

        // Do not filter by common date filter
        if (!currentWidget?.dateDataSet) {
            filters = filters.filter((f) => {
                if (isRelativeDateFilter(f)) {
                    return isObjRef(f.relativeDateFilter.dataSet);
                }
                if (isAbsoluteDateFilter(f)) {
                    return isObjRef(f.absoluteDateFilter.dataSet);
                }
                return true;
            });
        }

        return {
            filters,
            // without pending, the query would report false before it starts, causing errors downstream
            loading: status === "pending" || status === "running",
        };
    }, [dashboardFilters, result, widget, status]);
}

function createTempRichText(dateDataset: ICatalogDateDataset | undefined): IRichTextWidget {
    return {
        type: "richText",
        dateDataSet: dateDataset?.dataSet.ref,
        ignoreDashboardFilters: [],
        drills: [],
        content: "",
        title: "",
        description: "",
        ref: idRef(""),
        uri: "",
        identifier: "",
    };
}
