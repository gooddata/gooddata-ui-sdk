// (C) 2019 GoodData Corporation
import { DashboardExport } from "@gooddata/typings";
import { BAD_REQUEST_STATUS, SUCCESS_REQUEST_STATUS } from "../constants/errors";

export function isExportFinished(responseHeaders: Response): boolean {
    const taskState = responseHeaders.status;
    return taskState === SUCCESS_REQUEST_STATUS || taskState >= BAD_REQUEST_STATUS; // OK || ERROR
}

export function isDateFilter(
    filter: DashboardExport.FilterContextItem,
): filter is DashboardExport.IDateFilter {
    if ((filter as DashboardExport.IDateFilter).dateFilter) {
        return true;
    }
    return false;
}

export function sanitizeDateFilter(filter: DashboardExport.IDateFilter): DashboardExport.IDateFilter {
    const { dateFilter } = filter;

    const optionalProps: any = {};
    if (dateFilter.from) {
        optionalProps.from = String(dateFilter.from);
    }
    if (dateFilter.to) {
        optionalProps.to = String(dateFilter.to);
    }

    return {
        dateFilter: {
            ...dateFilter,
            ...optionalProps,
        },
    };
}

export function sanitizeDateFilters(
    filters: DashboardExport.FilterContextItem[],
): DashboardExport.FilterContextItem[] {
    return filters.map(
        (filter: DashboardExport.FilterContextItem): DashboardExport.FilterContextItem => {
            if (isDateFilter(filter)) {
                return sanitizeDateFilter(filter);
            }
            return filter;
        },
    );
}
