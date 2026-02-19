// (C) 2024-2026 GoodData Corporation

import { type IntlShape } from "react-intl";

import {
    type DateFilterGranularity,
    type IAbsoluteDateFilterValues,
    type IDateFilter,
    type IRelativeDateFilterValues,
    absoluteDateFilterValues,
    isRelativeDateFilter,
    relativeDateFilterValues,
} from "@gooddata/sdk-model";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";

interface IRelativeDateFilterMeta extends IRelativeDateFilterValues {
    type: "relative";
}

interface IAbsoluteDateFilterMeta extends IAbsoluteDateFilterValues {
    type: "absolute";
}

type DateFilterMeta = IRelativeDateFilterMeta | IAbsoluteDateFilterMeta;

export function translateDateFilter(intl: IntlShape, filter: IDateFilter, dateFormat: string): string {
    const metadata = filterMetadata(filter);

    // Keep consistent with `getDateFilterTitleUsingTranslator` in sdk-ui-filters:
    // - Special case for "All time" with excluded empty values.
    // - For included empty values, decorate the base representation.
    // - For "only" empty values, use the dedicated title.
    if (
        metadata.type === "relative" &&
        metadata.granularity === "ALL_TIME_GRANULARITY" &&
        metadata.emptyValueHandling === "exclude"
    ) {
        return intl.formatMessage({ id: "filters.allTime.exceptEmptyValues.title" });
    }

    if (metadata.emptyValueHandling === "only") {
        return intl.formatMessage({ id: "filters.emptyValues.title" });
    }

    const base =
        metadata.type === "absolute"
            ? DateFilterHelpers.formatAbsoluteDateRange(metadata.from, metadata.to, dateFormat)
            : DateFilterHelpers.formatRelativeDateRange(
                  metadata.from,
                  metadata.to,
                  metadata.granularity as DateFilterGranularity,
                  intl,
                  "full",
                  metadata.boundedFilter,
              );

    if (metadata.emptyValueHandling === "include") {
        return intl.formatMessage({ id: "filters.emptyValues.label" }, { title: base });
    }

    return base;
}

function filterMetadata(filter: IDateFilter): DateFilterMeta {
    if (isRelativeDateFilter(filter)) {
        return { ...relativeDateFilterValues(filter), type: "relative" };
    }

    return { ...absoluteDateFilterValues(filter), type: "absolute" };
}
