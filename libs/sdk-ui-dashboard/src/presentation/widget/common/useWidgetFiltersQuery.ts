// (C) 2020-2021 GoodData Corporation
import { useEffect } from "react";
import { IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    QueryProcessingStatus,
    queryWidgetFilters,
    selectFilterContextFilters,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../model";

/**
 * Hook for obtaining the effective filters for a widget.
 *
 * @param widget - widget to get effective filters for
 * @param filters - additional filters to apply
 * @returns set of filters that should be used to execute the given widget
 * @internal
 */
export const useWidgetFiltersQuery = (
    widget: IWidget | undefined,
    filters: IFilter[] | undefined,
): {
    result?: IFilter[];
    status?: QueryProcessingStatus;
    error?: GoodDataSdkError;
} => {
    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);
    const {
        run: runFiltersQuery,
        result,
        status,
        error,
    } = useDashboardQueryProcessing({
        queryCreator: queryWidgetFilters,
    });

    const effectiveFilters = result as IFilter[];

    useEffect(() => {
        if (widget) {
            // TODO how to prevent reloads in case ignored filter changes?
            runFiltersQuery(widget, filters);
        }
    }, [widget, dashboardFilters, filters]);

    return {
        result: effectiveFilters,
        status,
        error,
    };
};
