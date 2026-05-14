// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { type IntlShape, useIntl } from "react-intl";

import {
    type ICatalogMeasure,
    type IDashboardMeasureValueFilter,
    type IMeasureValueFilter,
    type ISeparators,
    type MeasureValueFilterCondition,
    type ObjRef,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";
import { getMeasureValueFilterConditionLabel } from "@gooddata/sdk-ui-filters";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogMeasures } from "../../../model/store/catalog/catalogSelectors.js";
import { selectLocale, selectSeparators } from "../../../model/store/config/configSelectors.js";

const PERCENT_FORMAT_REGEX = /%/;

function isPercentageFormat(format: string | undefined): boolean {
    return !!format && PERCENT_FORMAT_REGEX.test(format);
}

/**
 * Normalizes the output of the SDK `<MeasureValueFilter />` onApply callback into a single
 * `conditions` array. The SDK can return either `condition` (single comparison/range) or
 * `conditions` (multi-condition OR); the dashboard model only uses `conditions`. Returns
 * undefined when the filter is "All" (no condition selected).
 *
 * @internal
 */
export function normalizeMeasureValueFilterConditions(
    updated: IMeasureValueFilter | null,
): MeasureValueFilterCondition[] | undefined {
    const body = updated?.measureValueFilter;
    if (body?.conditions && body.conditions.length > 0) {
        return body.conditions;
    }
    if (body?.condition) {
        return [body.condition];
    }
    return undefined;
}

function findCatalogMetric(measure: ObjRef, measures: ICatalogMeasure[]): ICatalogMeasure | undefined {
    return measures.find((m) => areObjRefsEqual(m.measure.ref, measure));
}

/**
 * Derived data shared by every dashboard MVF host (filter bar, automation/scheduling dialog,
 * any future location). Resolves the catalog metric, computes title/format/percentage/conditions,
 * builds the execution-level MVF shape the SDK dropdown expects, and produces the condition
 * label shown on the chip.
 *
 * @internal
 */
export interface IDashboardMeasureValueFilterData {
    measure: ObjRef;
    localIdentifier: string;
    /** Custom title from the filter, if any. */
    customTitle: string | undefined;
    /** Catalog metric the filter references; undefined if not in the catalog. */
    catalogMetric: ICatalogMeasure | undefined;
    /** Title fallback when no custom title is set. */
    defaultMetricTitle: string;
    /** Effective title — custom title or catalog title or stringified objRef. */
    metricTitle: string;
    /** Catalog metric format pattern, if any. */
    format: string | undefined;
    /** Whether the format expresses a percentage. */
    usePercentage: boolean;
    /** Conditions from the (possibly working) filter the UI should reflect. */
    conditions: MeasureValueFilterCondition[] | undefined;
    /** Human-readable condition summary shown on the chip ("> 100 OR ≥ 50%"). */
    conditionLabel: string;
    /** Execution-level MVF that the SDK <MeasureValueFilter /> takes as `filter`. */
    dropdownFilter: IMeasureValueFilter;
    separators: ISeparators;
    locale: string;
    intl: IntlShape;
}

/**
 * Hook that resolves the shared data needed to render a dashboard MVF dropdown.
 *
 * The host owns the choice of which filter to reflect in the UI: the persisted filter
 * (`filter`), or the working/staged filter when "Apply together" mode is active. Pass
 * the chosen one as `filterToDisplay`; if omitted, `filter` itself is used.
 *
 * @internal
 */
export function useDashboardMeasureValueFilterData(
    filter: IDashboardMeasureValueFilter,
    filterToDisplay?: IDashboardMeasureValueFilter,
): IDashboardMeasureValueFilterData {
    const measures = useDashboardSelector(selectCatalogMeasures);
    const separators = useDashboardSelector(selectSeparators);
    const locale = useDashboardSelector(selectLocale);
    const intl = useIntl();

    const { measure, localIdentifier, title: customTitle } = filter.dashboardMeasureValueFilter;
    const effective = filterToDisplay ?? filter;
    const conditions = effective.dashboardMeasureValueFilter.conditions;

    const catalogMetric = useMemo(() => findCatalogMetric(measure, measures), [measure, measures]);
    const defaultMetricTitle = catalogMetric?.measure.title ?? objRefToString(measure);
    const metricTitle = customTitle ?? defaultMetricTitle;
    const format = catalogMetric?.measure.format;
    const usePercentage = isPercentageFormat(format);

    const conditionLabel = useMemo(
        () => getMeasureValueFilterConditionLabel(intl, conditions, { usePercentage, separators }),
        [intl, conditions, usePercentage, separators],
    );

    const dropdownFilter = useMemo<IMeasureValueFilter>(
        () => ({
            measureValueFilter: {
                measure,
                localIdentifier,
                ...(conditions && conditions.length > 0 ? { conditions } : {}),
            },
        }),
        [measure, localIdentifier, conditions],
    );

    return {
        measure,
        localIdentifier,
        customTitle,
        catalogMetric,
        defaultMetricTitle,
        metricTitle,
        format,
        usePercentage,
        conditions,
        conditionLabel,
        dropdownFilter,
        separators,
        locale,
        intl,
    };
}

/**
 * Props that every dashboard MVF host passes to the SDK `<MeasureValueFilter />` unchanged.
 * Host-specific bits — `DropdownButtonComponent`, `onApply`, `onChange`, `onCancel`,
 * `withoutApply`, `BodyComponent`, `DropdownActionsComponent`, `autoOpen` — are added
 * by the host on top of this bundle.
 *
 * @internal
 */
export interface ISharedDashboardMvfProps {
    filter: IMeasureValueFilter;
    measureIdentifier: string;
    buttonTitle: string;
    measureTitle: string;
    usePercentage: boolean;
    format: string | undefined;
    useShortFormat: true;
    displayTreatNullAsZeroOption: true;
    separators: ISeparators;
    locale: string;
    enableOperatorSelection: true;
    enableMultipleConditions: true;
    isDimensionalityEnabled: false;
    isFilterSummaryEnabled: true;
    isHeaderEnabled: true;
}

/**
 * Build the shared `<MeasureValueFilter />` prop bundle from the data hook output.
 * Spread this into the SDK component and add host-specific props after.
 *
 * @internal
 */
export function getSharedDashboardMvfProps(data: IDashboardMeasureValueFilterData): ISharedDashboardMvfProps {
    return {
        filter: data.dropdownFilter,
        measureIdentifier: data.localIdentifier,
        buttonTitle: data.metricTitle,
        measureTitle: data.metricTitle,
        usePercentage: data.usePercentage,
        format: data.format,
        useShortFormat: true,
        displayTreatNullAsZeroOption: true,
        separators: data.separators,
        locale: data.locale,
        enableOperatorSelection: true,
        enableMultipleConditions: true,
        isDimensionalityEnabled: false,
        isFilterSummaryEnabled: true,
        isHeaderEnabled: true,
    };
}
