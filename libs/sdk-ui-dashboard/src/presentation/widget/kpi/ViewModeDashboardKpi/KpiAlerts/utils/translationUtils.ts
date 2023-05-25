// (C) 2019-2023 GoodData Corporation
import { IntlShape } from "react-intl";
import lowerFirst from "lodash/lowerFirst.js";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import {
    absoluteDateFilterValues,
    IAbsoluteDateFilterValues,
    IDateFilter,
    IRelativeDateFilterValues,
    isAbsoluteDateFilter,
    isAllTimeDateFilter,
    isRelativeDateFilter,
    relativeDateFilterValues,
    DateFilterGranularity,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";
import { messages } from "../../../../../../locales.js";

export type KpiAlertTranslationData = {
    rangeText: string;
    intlIdRoot: string;
} | null;

interface IRelativeDateFilterMeta extends IRelativeDateFilterValues {
    type: "relative";
}

interface IAbsoluteDateFilterMeta extends IAbsoluteDateFilterValues {
    type: "absolute";
}

type DateFilterMeta = IRelativeDateFilterMeta | IAbsoluteDateFilterMeta;

function filterMetadata(filter: IDateFilter | IDashboardDateFilter): DateFilterMeta {
    if (isRelativeDateFilter(filter)) {
        return { ...relativeDateFilterValues(filter), type: "relative" };
    } else if (isAbsoluteDateFilter(filter)) {
        return { ...absoluteDateFilterValues(filter), type: "absolute" };
    } else if (filter.dateFilter.type === "relative") {
        return {
            type: "relative",
            from: Number.parseInt(filter.dateFilter.from?.toString() ?? "0", 10),
            to: Number.parseInt(filter.dateFilter.to?.toString() ?? "0", 10),
            granularity: filter.dateFilter.granularity,
        };
    } else {
        return {
            type: "absolute",
            from: filter.dateFilter.from!.toString(),
            to: filter.dateFilter.to!.toString(),
        };
    }
}

export function translateDateFilter(
    filter: IDateFilter | IDashboardDateFilter,
    intl: IntlShape,
    dateFormat: string,
): string {
    const metadata = filterMetadata(filter);

    return metadata.type === "absolute"
        ? DateFilterHelpers.formatAbsoluteDateRange(metadata.from, metadata.to, dateFormat)
        : DateFilterHelpers.formatRelativeDateRange(
              metadata.from,
              metadata.to,
              metadata.granularity as DateFilterGranularity,
              intl,
          );
}

function getIntlIdRoot(filter: IDateFilter | IDashboardDateFilter): string {
    const metadata = filterMetadata(filter);

    if (metadata.type === "absolute") {
        return messages.alertMessageRelativePresetInPeriod.id!;
    }

    const hasOneBoundToday = metadata.from === 0 || metadata.to === 0; // e.g. last 4 months, next 6 days
    const isLastOneX = metadata.from === -1 && metadata.to === -1; // e.g last month
    const isNextOneX = metadata.from === 1 && metadata.to === 1; // e.g. next month

    return hasOneBoundToday || isLastOneX || isNextOneX
        ? messages.alertMessageRelativePreset.id!
        : messages.alertMessageRelativePresetInPeriod.id!;
}

export function getKpiAlertTranslationData(
    filter: IDateFilter | IDashboardDateFilter | undefined,
    intl: IntlShape,
    dateFormat: string,
): KpiAlertTranslationData {
    if (!filter || isAllTimeDateFilter(filter)) {
        return null;
    }

    return {
        intlIdRoot: getIntlIdRoot(filter),
        rangeText: lowerFirst(translateDateFilter(filter, intl, dateFormat)),
    };
}
