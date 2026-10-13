// (C) 2024-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { type DependsOnDateFilter } from "@gooddata/api-client-tiger";
import {
    type DateAttributeGranularity,
    type IAbsoluteDateFilter,
    type IRelativeDateFilter,
    isRelativeBoundedDateFilter,
    isRelativeDateFilter,
    isUriRef,
} from "@gooddata/sdk-model";

import { toTigerGranularity } from "../../../../convertors/fromBackend/dateGranularityConversions.js";
import {
    hasPeriodLiteral,
    toWholePeriodLiterals,
} from "../../../../convertors/shared/absoluteGranularityLiterals.js";

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
    const { dataSet: localIdentifier, from, to, granularity } = dateFilter.absoluteDateFilter;

    invariant(!isUriRef(localIdentifier));

    const dataset = {
        identifier: {
            id: localIdentifier.identifier,
            type: "dataset" as const,
        },
    };

    if (hasPeriodLiteral(granularity)) {
        const literals = toWholePeriodLiterals(granularity, from, to);
        if (literals) {
            return {
                dateFilter: {
                    absoluteGranularityDateFilter: {
                        dataset,
                        granularity: toTigerGranularity(granularity),
                        ...literals,
                    },
                },
            };
        }
    }

    return {
        dateFilter: {
            absoluteDateFilter: {
                dataset,
                from,
                to,
            },
        },
    };
}
