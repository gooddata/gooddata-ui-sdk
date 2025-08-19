// (C) 2024-2025 GoodData Corporation
import { invariant } from "ts-invariant";

import { DependsOnDateFilter } from "@gooddata/api-client-tiger";
import {
    DateAttributeGranularity,
    IAbsoluteDateFilter,
    IRelativeDateFilter,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    isUriRef,
} from "@gooddata/sdk-model";

import { toTigerGranularity } from "../../../../convertors/fromBackend/dateGranularityConversions.js";

export function mapDashboardDateFilterToDependentDateFilter(
    dateFilter: IRelativeDateFilter | IAbsoluteDateFilter,
) {
    if (isRelativeDateFilter(dateFilter)) {
        return newRelativeDependentDateFilter(dateFilter);
    } else {
        return newAbsoluteDependentDateFilter(dateFilter);
    }
}

function newRelativeDependentDateFilter(dateFilter: IRelativeDateFilter): DependsOnDateFilter {
    const localIdentifier = dateFilter.relativeDateFilter.dataSet;
    invariant(!isUriRef(localIdentifier));

    const boundedFilter = isRelativeBoundedDateFilter(dateFilter)
        ? {
              ...dateFilter.relativeDateFilter.boundedFilter,
              granularity: toTigerGranularity(dateFilter.relativeDateFilter.boundedFilter.granularity),
          }
        : undefined;

    return {
        dateFilter: {
            relativeDateFilter: {
                dataset: {
                    identifier: {
                        id: localIdentifier.identifier,
                        type: "dataset",
                    },
                },
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
    const localIdentifier = dateFilter.absoluteDateFilter.dataSet;

    invariant(!isUriRef(localIdentifier));

    return {
        dateFilter: {
            absoluteDateFilter: {
                dataset: {
                    identifier: {
                        id: localIdentifier.identifier,
                        type: "dataset",
                    },
                },
                from: dateFilter.absoluteDateFilter.from,
                to: dateFilter.absoluteDateFilter.to,
            },
        },
    };
}
