// (C) 2019-2021 GoodData Corporation
import { IntlShape } from "react-intl";
import lowerFirst from "lodash/lowerFirst";
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
} from "@gooddata/sdk-model";
import {
    DateFilterGranularity,
    IAbsoluteDateFilterPreset,
    IDashboardDateFilter,
    IRelativeDateFilterPreset,
} from "@gooddata/sdk-backend-spi";

export type KpiAlertTranslationData = {
    rangeText: string;
    intlIdRoot: string;
} | null;

export function dashboardDateFilterToPreset(
    filter: IDashboardDateFilter,
): IRelativeDateFilterPreset | IAbsoluteDateFilterPreset {
    if (filter.dateFilter.type === "absolute") {
        const result: IAbsoluteDateFilterPreset = {
            localIdentifier: "",
            type: "absolutePreset",
            visible: true,
            from: filter.dateFilter.from?.toString(),
            to: filter.dateFilter.to?.toString(),
        };
        return result;
    } else {
        const result: IRelativeDateFilterPreset = {
            localIdentifier: "",
            type: "relativePreset",
            visible: true,
            granularity: filter.dateFilter.granularity,
            from: Number.parseInt(filter.dateFilter.from?.toString() ?? "0", 10),
            to: Number.parseInt(filter.dateFilter.to?.toString() ?? "0", 10),
        };
        return result;
    }
}

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
            from: filter.dateFilter.from?.toString(),
            to: filter.dateFilter.to?.toString(),
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
        return "filters.alertMessage.relativePreset.inPeriod";
    }

    const hasOneBoundToday = metadata.from === 0 || metadata.to === 0; // e.g. last 4 months, next 6 days
    const isLastOneX = metadata.from === -1 && metadata.to === -1; // e.g last month
    const isNextOneX = metadata.from === 1 && metadata.to === 1; // e.g. next month

    return hasOneBoundToday || isLastOneX || isNextOneX
        ? "filters.alertMessage.relativePreset"
        : "filters.alertMessage.relativePreset.inPeriod";
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
