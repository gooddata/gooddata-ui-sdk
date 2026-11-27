// (C) 2024-2026 GoodData Corporation

import { type DependsOnDateFilter } from "@gooddata/api-client-tiger";
import {
    type DateAttributeGranularity,
    type IAbsoluteDateFilter,
    type IAbsoluteGranularityDateFilter,
    type IRelativeDateFilter,
    isAbsoluteGranularityDateFilter,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
} from "@gooddata/sdk-model";

import { toTigerGranularity } from "../../../../convertors/fromBackend/dateGranularityConversions.js";
import { toDateDataSetQualifier } from "../../../../convertors/toBackend/ObjRefConverter.js";

export function mapDashboardDateFilterToDependentDateFilter(
    dateFilter: IRelativeDateFilter | IAbsoluteDateFilter | IAbsoluteGranularityDateFilter,
): DependsOnDateFilter {
    if (isRelativeDateFilter(dateFilter)) {
        return newRelativeDependentDateFilter(dateFilter);
    } else if (isAbsoluteGranularityDateFilter(dateFilter)) {
        return newAbsoluteGranularityDependentDateFilter(dateFilter);
    } else {
        return newAbsoluteDependentDateFilter(dateFilter);
    }
}

function newRelativeDependentDateFilter(dateFilter: IRelativeDateFilter): DependsOnDateFilter {
    const boundedFilter = isRelativeBoundedDateFilter(dateFilter)
        ? {
              ...dateFilter.relativeDateFilter.boundedFilter,
              granularity: toTigerGranularity(dateFilter.relativeDateFilter.boundedFilter.granularity),
          }
        : undefined;

    return {
        dateFilter: {
            relativeDateFilter: {
                dataset: toDateDataSetQualifier(dateFilter.relativeDateFilter.dataSet),
                granularity: toTigerGranularity(
                    dateFilter.relativeDateFilter.granularity as DateAttributeGranularity,
                ),
                from: dateFilter.relativeDateFilter.from,
                to: dateFilter.relativeDateFilter.to,
                ...(boundedFilter ? { boundedFilter } : {}),
            },
        },
    };
}

function newAbsoluteDependentDateFilter(dateFilter: IAbsoluteDateFilter): DependsOnDateFilter {
    return {
        dateFilter: {
            absoluteDateFilter: {
                dataset: toDateDataSetQualifier(dateFilter.absoluteDateFilter.dataSet),
                from: dateFilter.absoluteDateFilter.from,
                to: dateFilter.absoluteDateFilter.to,
            },
        },
    };
}

function newAbsoluteGranularityDependentDateFilter(
    dateFilter: IAbsoluteGranularityDateFilter,
): DependsOnDateFilter {
    const { dataSet, granularity, from, to } = dateFilter.absoluteGranularityDateFilter;

    return {
        dateFilter: {
            absoluteGranularityDateFilter: {
                dataset: toDateDataSetQualifier(dataSet),
                granularity: toTigerGranularity(granularity),
                ...(from === undefined ? {} : { from }),
                ...(to === undefined ? {} : { to }),
            },
        },
    };
}
