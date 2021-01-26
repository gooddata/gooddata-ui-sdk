// (C) 2021 GoodData Corporation
import {
    FilterContextItem,
    IAttributeElement,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IDataSetMetadataObject,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IWidgetAlertDefinition,
    IWidgetDefinition,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    areObjRefsEqual,
    attributeElementsIsEmpty,
    filterObjRef,
    IFilter,
    isAttributeElementsByRef,
    isAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { ILocale } from "@gooddata/sdk-ui";
import { DateFilterHelpers } from "@gooddata/sdk-ui-filters";
import last from "lodash/last";
import partition from "lodash/partition";
import { IntlShape } from "react-intl";

import { isAttributeFilterIgnored, isDateFilterIrrelevant } from "../../utils/filterUtils";

import { dashboardDateFilterToPreset } from "./translationUtils";
import {
    BrokenAlertType,
    IBrokenAlertAttributeFilter,
    IBrokenAlertDateFilter,
    IBrokenAlertFilter,
} from "../types";

export interface IBrokenAlertFilterBasicInfo<TFilter extends FilterContextItem = FilterContextItem> {
    alertFilter: TFilter;
    brokenType: BrokenAlertType;
}

function isBrokenAlertDateFilterInfo(
    item: IBrokenAlertFilterBasicInfo,
): item is IBrokenAlertFilterBasicInfo<IDashboardDateFilter> {
    return isDashboardDateFilter(item.alertFilter);
}

function isBrokenAlertAttributeFilterInfo(
    item: IBrokenAlertFilterBasicInfo,
): item is IBrokenAlertFilterBasicInfo<IDashboardAttributeFilter> {
    return isDashboardAttributeFilter(item.alertFilter);
}

function isFilterNoop(filter: IDashboardAttributeFilter): boolean {
    return (
        filter.attributeFilter.negativeSelection &&
        attributeElementsIsEmpty(filter.attributeFilter.attributeElements)
    );
}

/**
 * Gets the information about the so called broken alert filters. These are filters that are set up on the alert,
 * but the currently applied filters either do not contain them, or the KPI has started ignoring them
 * since the alert was first set up.
 *
 * @param alert the alert to compute the broken filters for
 * @param kpi the KPI widget that the alert is relevant to
 * @param appliedFilters all the currently applied filters (including All Time date filters)
 */
export function getBrokenAlertFiltersBasicInfo(
    alert: IWidgetAlertDefinition | undefined,
    kpi: IWidgetDefinition,
    appliedFilters: IFilter[],
): IBrokenAlertFilterBasicInfo[] {
    const alertFilters = alert?.filterContext?.filters;

    // no filters -> no filters can be broken, bail early
    if (!alertFilters) {
        return [];
    }

    const result: IBrokenAlertFilterBasicInfo[] = [];
    const [alertDateFilters, alertAttributeFilters] = partition(alertFilters, isDashboardDateFilter) as [
        IDashboardDateFilter[],
        IDashboardAttributeFilter[],
    ];

    // attribute filters
    const appliedAttributeFilters = appliedFilters.filter(isAttributeFilter);
    alertAttributeFilters.forEach((alertFilter) => {
        // ignored attribute filters are broken even if they are noop
        const isIgnored = isAttributeFilterIgnored(kpi, alertFilter.attributeFilter.displayForm);
        if (isIgnored) {
            result.push({
                alertFilter,
                brokenType: "ignored",
            });

            return;
        }

        // deleted attribute filters are broken only if they are not noop
        const isInAppliedFilters = appliedAttributeFilters.some((f) =>
            areObjRefsEqual(filterObjRef(f), alertFilter.attributeFilter.displayForm),
        );

        const isDeleted = !isInAppliedFilters;
        const isNoop = isFilterNoop(alertFilter);

        if (isDeleted && !isNoop) {
            result.push({
                alertFilter,
                brokenType: "deleted",
            });
        }
    });

    // date filter
    const alertDateFilter = last(alertDateFilters);
    if (alertDateFilter) {
        const isIrrelevantNow = isDateFilterIrrelevant(kpi);
        if (isIrrelevantNow) {
            result.push({
                alertFilter: {
                    dateFilter: {
                        ...alertDateFilter.dateFilter,
                        dataSet: alertDateFilter.dateFilter.dataSet ?? kpi.dateDataSet, // make sure the dataSet is filled
                    },
                },
                brokenType: "ignored",
            });
        }
    }

    return result;
}

interface IAttributeFilterMeta {
    validElements: IAttributeElement[];
    totalElementsCount: number;
    title: string;
}

export type IAttributeFilterMetaCollection = { [ref: string]: IAttributeFilterMeta };

/**
 * Takes basic broken alert info and adds additional information used for displaying of such filters to the user.
 *
 * @param brokenAlertFilters the basic broken alert filters info to enrich
 * @param intl the intl object used
 * @param dateFormat the date format to be used
 * @param dateDataSets all available date data sets
 * @param attributeFiltersMeta additional information about attribute filters (see {@link IAttributeFilterMetaCollection} for details)
 */
export function enrichBrokenAlertsInfo(
    brokenAlertFilters: IBrokenAlertFilterBasicInfo[],
    intl: IntlShape,
    dateFormat: string,
    dateDataSets: IDataSetMetadataObject[],
    attributeFiltersMeta: IAttributeFilterMetaCollection,
): IBrokenAlertFilter[] {
    return brokenAlertFilters.map((brokenFilter) => {
        if (isBrokenAlertAttributeFilterInfo(brokenFilter)) {
            return enrichBrokenAttributeFilter(brokenFilter, attributeFiltersMeta);
        }

        if (isBrokenAlertDateFilterInfo(brokenFilter)) {
            return enrichBrokenDateFilter(brokenFilter, intl, dateFormat, dateDataSets);
        }

        throw new UnexpectedError("Unknown broken alert filter type.");
    });
}

function enrichBrokenDateFilter(
    brokenFilter: IBrokenAlertFilterBasicInfo<IDashboardDateFilter>,
    intl: IntlShape,
    dateFormat: string,
    dateDataSets: IDataSetMetadataObject[],
): IBrokenAlertDateFilter {
    const { alertFilter, brokenType } = brokenFilter;
    // TODO clear this up so that the conversion is not needed
    const dateFilterTitle = DateFilterHelpers.getDateFilterTitle(
        dashboardDateFilterToPreset(alertFilter),
        intl.locale as ILocale,
        dateFormat,
    );

    const matchingDateDataset = dateDataSets.find((dataset) =>
        areObjRefsEqual(dataset, alertFilter.dateFilter.dataSet),
    );

    return {
        type: "date",
        brokenType: brokenType,
        dateFilterTitle,
        title: matchingDateDataset?.title ?? intl.formatMessage({ id: "configurationPanel.date" }), // TODO: migrate this default to SDK with a more appropriate name
    };
}

function enrichBrokenAttributeFilter(
    brokenFilter: IBrokenAlertFilterBasicInfo<IDashboardAttributeFilter>,
    attributeFiltersMeta: IAttributeFilterMetaCollection,
): IBrokenAlertAttributeFilter {
    const { alertFilter, brokenType } = brokenFilter;
    const metaKey = objRefToString(alertFilter.attributeFilter.displayForm);
    const meta = attributeFiltersMeta[metaKey];

    const isNegative = alertFilter.attributeFilter.negativeSelection;
    const totalCount = meta.totalElementsCount;
    const elements = meta.validElements.filter((element) => {
        const isInSelected = isAttributeElementsByRef(alertFilter.attributeFilter.attributeElements)
            ? alertFilter.attributeFilter.attributeElements.uris.some((uri) => uri === element.uri)
            : alertFilter.attributeFilter.attributeElements.values.some((value) => value === element.title);

        return isInSelected !== isNegative;
    });

    const selection = elements.map((el) => el.title).join(", ");
    const title = meta.title;
    const selectedCount = isAttributeElementsByRef(alertFilter.attributeFilter.attributeElements)
        ? alertFilter.attributeFilter.attributeElements.uris.length
        : alertFilter.attributeFilter.attributeElements.values.length;

    return {
        type: "attribute",
        brokenType: brokenType,
        isAllSelected: isNegative && attributeElementsIsEmpty(alertFilter.attributeFilter.attributeElements),
        selection,
        selectionSize: isNegative ? totalCount - selectedCount : selectedCount,
        title,
    };
}
