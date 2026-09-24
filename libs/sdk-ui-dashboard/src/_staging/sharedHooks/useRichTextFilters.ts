// (C) 2025-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import {
    type ICatalogDateDataset,
    type IFilter,
    type IInsightWidget,
    type IRichTextWidget,
    areObjRefsEqual,
    filterContextItemsToDashboardFiltersByRichTextWidget,
    idRef,
    isAbsoluteDateFilter,
    isObjRef,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import {
    type IInsightDateDatasets,
    type IQueryInsightDateDatasets,
    queryDateDatasetsForInsight,
} from "../../model/queries/insights.js";
import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import {
    type QueryProcessingStatus,
    useDashboardQueryProcessing,
} from "../../model/react/useDashboardQueryProcessing.js";
import { useWidgetFilters } from "../../model/react/useWidgetFilters.js";
import { selectExecutableDashboardFilters } from "../../model/store/filtering/dashboardFilterSelectors.js";
import { selectSectionHeadersDateDataSet } from "../../model/store/meta/metaSelectors.js";

const NO_FILTERS: IFilter[] = [];

/**
 * Hook for obtaining effective filters for Rich Text widgets.
 *
 * Uses the same sophisticated filter resolution as Insight widgets, which:
 * - Respects widget's `ignoreDashboardFilters` configuration
 * - Re-computes when filter settings change
 * - Validates filters against backend
 *
 * @param widget - Rich Text or Insight widget to get filters for
 * @returns filters; `undefined` while they load
 *
 * @internal
 */
export function useRichTextWidgetFilters(widget: IRichTextWidget | IInsightWidget): IFilter[] | undefined {
    const { result, status } = useWidgetFilters(widget);
    return isLoading(status) ? undefined : (result ?? NO_FILTERS);
}

/**
 * Hook for obtaining filters for section descriptions with Rich Text content.
 *
 * Section descriptions always receive all dashboard filters (no ignoring),
 * and use the dashboard-level date dataset configuration.
 *
 * @returns filters; `undefined` while they load
 *
 * @internal
 */
export function useSectionDescriptionFilters(): IFilter[] | undefined {
    const dashboardFilters = useDashboardSelector(selectExecutableDashboardFilters);
    const sectionHeadersDateDataSet = useDashboardSelector(selectSectionHeadersDateDataSet);

    const {
        run: queryDateDatasets,
        result,
        status,
    } = useDashboardQueryProcessing<
        IQueryInsightDateDatasets,
        IInsightDateDatasets,
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

    return isLoading(status) ? undefined : filters;
}

function isLoading(status: QueryProcessingStatus): boolean {
    return status === "pending" || status === "running";
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
