// (C) 2021-2022 GoodData Corporation

import last from "lodash/last.js";
import partition from "lodash/partition.js";
import {
    areObjRefsEqual,
    filterObjRef,
    IFilter,
    isAttributeFilter,
    ObjRef,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilterReference,
    isDashboardDateFilter,
    isDashboardDateFilterReference,
    IWidgetAlertDefinition,
    IAttributeDisplayFormMetadataObject,
    IWidgetDefinition,
} from "@gooddata/sdk-model";
import { IBrokenAlertFilterBasicInfo } from "../types/alertTypes.js";
import { ObjRefMap } from "../../_staging/metadata/objRefMap.js";
import { invariant } from "ts-invariant";

/**
 * Gets the information about the so called broken alert filters. These are filters that are set up on the alert,
 * but the currently applied filters either do not contain them, or the KPI has started ignoring them
 * since the alert was first set up.
 *
 * @param alert - the alert to compute the broken filters for
 * @param kpi - the KPI widget that the alert is relevant to
 * @param appliedFilters - all the currently applied filters (including All Time date filters)
 * @param displayFormsMap - map of all resolved related display forms
 *
 * @internal
 */
export function getBrokenAlertFiltersBasicInfo(
    alert: IWidgetAlertDefinition | undefined,
    kpi: IWidgetDefinition,
    appliedFilters: IFilter[],
    displayFormsMap: ObjRefMap<IAttributeDisplayFormMetadataObject>,
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
        const attributeFilterDisplayForm = displayFormsMap.get(alertFilter.attributeFilter.displayForm);

        invariant(
            attributeFilterDisplayForm,
            `Alert filter display form not resolved ${alertFilter.attributeFilter.displayForm}`,
        );

        // ignored attribute filters are broken even if they are noop
        const isIgnored = isAttributeFilterIgnored(kpi, attributeFilterDisplayForm.ref);
        if (isIgnored) {
            result.push({
                alertFilter,
                brokenType: "ignored",
            });

            return;
        }

        // deleted attribute filters are broken even if they are noop
        const isInAppliedFilters = appliedAttributeFilters.some((f) =>
            areObjRefsEqual(filterObjRef(f), attributeFilterDisplayForm.ref),
        );

        const isDeleted = !isInAppliedFilters;
        if (isDeleted) {
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

function isAttributeFilterIgnored(widget: IWidgetDefinition, displayForm: ObjRef): boolean {
    return widget.ignoreDashboardFilters.some(
        (filter) =>
            isDashboardAttributeFilterReference(filter) && areObjRefsEqual(filter.displayForm, displayForm),
    );
}

function isDateFilterIrrelevant(widget: IWidgetDefinition): boolean {
    const dateDataSetRef = widget.dateDataSet;
    // backward compatibility for old kpis
    const ignoredOldWay = !!dateDataSetRef && isDateFilterIgnored(widget, dateDataSetRef);
    // now dataSetRef is cleaned
    const checkboxEnabled = !!dateDataSetRef;
    return !checkboxEnabled || ignoredOldWay;
}

function isDateFilterIgnored(widget: IWidgetDefinition, displayForm: ObjRef): boolean {
    return widget.ignoreDashboardFilters.some(
        (filter) => isDashboardDateFilterReference(filter) && areObjRefsEqual(filter.dataSet, displayForm),
    );
}
