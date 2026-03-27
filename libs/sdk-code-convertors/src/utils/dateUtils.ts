// (C) 2024-2026 GoodData Corporation

import { type AfmObjectIdentifier } from "@gooddata/api-client-tiger";

import { convertGranularityToId } from "./granularityUtils.js";
import { isRelativeDateFilter } from "./typeGuards.js";
import { createIdentifier } from "./yamlUtils.js";
import type {
    DateDataset,
    DateFilter,
    PoPMetricField,
    PreviousPeriodMetricField,
    Query,
} from "../schemas/v1/metadata.js";

export function mapDateAttribute(query: Query, field: PoPMetricField): AfmObjectIdentifier | null {
    let filter: DateFilter | undefined;
    Object.keys(query.filter_by ?? {}).forEach((key) => {
        const filterFound = query.filter_by![key];
        if (isRelativeDateFilter(filterFound) && filterFound.using === field.date_filter) {
            filter = {
                type: "date_filter",
                granularity: filterFound.granularity,
                from: filterFound.from,
                to: filterFound.to,
                using: filterFound?.using,
            } as DateFilter;
        }
    });

    if (filter) {
        return createIdentifier(
            `${filter.using}.${convertGranularityToId(
                filter.granularity as Required<DateDataset>["granularities"][number],
            )}`,
            { forceType: "attribute" },
        );
    }
    return null;
}

export function mapDateDataset(query: Query, field: PreviousPeriodMetricField): AfmObjectIdentifier | null {
    let filter: DateFilter | undefined;

    Object.keys(query.filter_by ?? {}).forEach((key) => {
        const filterFound = query.filter_by![key];
        if (isRelativeDateFilter(filterFound) && filterFound.using === field.date_filter) {
            filter = {
                type: "date_filter",
                granularity: filterFound.granularity,
                from: filterFound.from,
                to: filterFound.to,
                using: filterFound?.using,
            } as DateFilter;
        }
    });

    if (filter) {
        return createIdentifier(filter.using, { forceType: "dataset" });
    }
    return null;
}
