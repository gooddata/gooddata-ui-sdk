// (C) 2024-2025 GoodData Corporation
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

    return metadata.type === "absolute"
        ? DateFilterHelpers.formatAbsoluteDateRange(metadata.from, metadata.to, dateFormat)
        : DateFilterHelpers.formatRelativeDateRange(
              metadata.from,
              metadata.to,
              metadata.granularity as DateFilterGranularity,
              intl,
              metadata.boundedFilter,
          );
}

function filterMetadata(filter: IDateFilter): DateFilterMeta {
    if (isRelativeDateFilter(filter)) {
        return { ...relativeDateFilterValues(filter), type: "relative" };
    }

    return { ...absoluteDateFilterValues(filter), type: "absolute" };
}
