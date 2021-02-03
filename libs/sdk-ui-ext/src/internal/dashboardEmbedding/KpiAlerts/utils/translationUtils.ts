// (C) 2019-2021 GoodData Corporation
import { IntlShape } from "react-intl";
import lowerFirst from "lodash/lowerFirst";
import { isRelativeDateFilterOption, DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import { ILocale } from "@gooddata/sdk-ui";
import {
    absoluteDateFilterValues,
    IAbsoluteDateFilter,
    IDateFilter,
    IRelativeDateFilter,
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

function relativeFilterToRelativePreset(filter: IRelativeDateFilter): IRelativeDateFilterPreset {
    const { from, to, granularity } = relativeDateFilterValues(filter);
    return {
        localIdentifier: "",
        type: "relativePreset",
        visible: true,
        from,
        to,
        granularity: granularity as DateFilterGranularity,
    };
}

function absoluteFilterToRelativePreset(filter: IAbsoluteDateFilter): IAbsoluteDateFilterPreset {
    const { from, to } = absoluteDateFilterValues(filter);
    return {
        localIdentifier: "",
        type: "absolutePreset",
        visible: true,
        from,
        to,
    };
}

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

// TODO (RAIL-2847) when moving this to SDK8, expose the translation logic for date filters directly without the conversion to date filter options
export function getKpiAlertTranslationData(
    filter: IDateFilter | IDashboardDateFilter | undefined,
    intl: IntlShape,
    dateFormat: string,
): KpiAlertTranslationData {
    if (!filter || isAllTimeDateFilter(filter)) {
        return null;
    }

    const option = isRelativeDateFilter(filter)
        ? relativeFilterToRelativePreset(filter)
        : isAbsoluteDateFilter(filter)
        ? absoluteFilterToRelativePreset(filter)
        : dashboardDateFilterToPreset(filter);

    const rangeText = lowerFirst(
        DateFilterHelpers.getDateFilterRepresentation(option, intl.locale as ILocale, dateFormat),
    );

    const hasOneBoundToday = option.from === 0 || option.to === 0; // e.g. last 4 months, next 6 days
    const isLastOneX = option.from === -1 && option.to === -1; // e.g last month
    const isNextOneX = option.from === 1 && option.to === 1; // e.g. next month

    const intlIdRoot =
        isRelativeDateFilterOption(option) && (hasOneBoundToday || isLastOneX || isNextOneX)
            ? "filters.alertMessage.relativePreset"
            : "filters.alertMessage.relativePreset.inPeriod";

    return {
        intlIdRoot,
        rangeText,
    };
}
