// (C) 2025 GoodData Corporation

import { useEffect, useMemo } from "react";

import {
    type ICatalogDateDataset,
    type IFilter,
    type IInsightWidget,
    type IRichTextWidget,
    areObjRefsEqual,
    idRef,
    isAbsoluteDateFilter,
    isObjRef,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import { filterContextItemsToDashboardFiltersByRichTextWidget } from "../../converters/index.js";
import {
    type InsightDateDatasets,
    type QueryInsightDateDatasets,
    queryDateDatasetsForInsight,
    selectFilterContextFilters,
    selectSectionHeadersDateDataSet,
    useDashboardQueryProcessing,
    useDashboardSelector,
    useWidgetFilters,
} from "../../model/index.js";

/**
 * Result of {@link useRichTextWidgetFilters} and {@link useSectionDescriptionFilters} hooks.
 */
interface IRichTextFiltersResult {
    /**
     * Filters to apply to Rich Text content.
     */
    filters: IFilter[];

    /**
     * Whether the filters are still loading.
     */
    loading: boolean;

    /**
     * Error that occurred while loading filters, if any.
     */
    error?: Error;
}

/**
 * Hook for obtaining effective filters for Rich Text widgets.
 *
 * Uses the same sophisticated filter resolution as Insight widgets, which:
 * - Respects widget's `ignoreDashboardFilters` configuration
 * - Re-computes when filter settings change
 * - Validates filters against backend
 *
 * @param widget - Rich Text or Insight widget to get filters for
 * @returns filters, loading state, and error
 *
 * @internal
 */
export function useRichTextWidgetFilters(widget: IRichTextWidget | IInsightWidget): IRichTextFiltersResult {
    const widgetFiltersQuery = useWidgetFilters(widget);

    return useMemo(
        () => ({
            filters: widgetFiltersQuery.result ?? [],
            loading: widgetFiltersQuery.status === "pending" || widgetFiltersQuery.status === "running",
            error: widgetFiltersQuery.error,
        }),
        [widgetFiltersQuery.result, widgetFiltersQuery.status, widgetFiltersQuery.error],
    );
}

/**
 * Hook for obtaining filters for section descriptions with Rich Text content.
 *
 * Section descriptions always receive all dashboard filters (no ignoring),
 * and use the dashboard-level date dataset configuration.
 *
 * @returns filters, loading state, and error
 *
 * @internal
 */
export function useSectionDescriptionFilters(): IRichTextFiltersResult {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const sectionHeadersDateDataSet = useDashboardSelector(selectSectionHeadersDateDataSet);

    const {
        run: queryDateDatasets,
        result,
        status,
        error,
    } = useDashboardQueryProcessing<
        QueryInsightDateDatasets,
        InsightDateDatasets,
        Parameters<typeof queryDateDatasetsForInsight>
    >({
        queryCreator: queryDateDatasetsForInsight,
    });

    useEffect(() => {
        queryDateDatasets();
    }, [queryDateDatasets]);

    const tempWidget = useMemo(() => {
        let dateDataset: ICatalogDateDataset | undefined;
        if (sectionHeadersDateDataSet && result) {
            dateDataset = result.dateDatasets.find((ds) =>
                areObjRefsEqual(ds.dataSet.ref, sectionHeadersDateDataSet),
            );
        }
        if (!dateDataset && result) {
            dateDataset = result.dateDatasetsOrdered?.[0];
        }
        return createTempRichText(dateDataset);
    }, [result, sectionHeadersDateDataSet]);

    const filters = useMemo(() => {
        let convertedFilters = filterContextItemsToDashboardFiltersByRichTextWidget(
            dashboardFilters,
            tempWidget,
        );

        // Do not filter by common date filter if no date dataset is configured
        if (!tempWidget.dateDataSet) {
            convertedFilters = convertedFilters.filter((f) => {
                if (isRelativeDateFilter(f)) {
                    return isObjRef(f.relativeDateFilter.dataSet);
                }
                if (isAbsoluteDateFilter(f)) {
                    return isObjRef(f.absoluteDateFilter.dataSet);
                }
                return true;
            });
        }

        return convertedFilters;
    }, [dashboardFilters, tempWidget]);

    return useMemo(
        () => ({
            filters,
            loading: status === "pending" || status === "running",
            error,
        }),
        [filters, status, error],
    );
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
