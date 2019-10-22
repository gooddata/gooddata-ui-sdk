// (C) 2007-2018 GoodData Corporation
import flatMap from "lodash/flatMap";
import compact from "lodash/compact";
import { AFM } from "@gooddata/typings";

export const ALL_TIME_GRANULARITY = "ALL_TIME_GRANULARITY";

export interface INormalizedAFM {
    attributes: AFM.IAttribute[];
    measures: AFM.IMeasure[];
    filters: AFM.CompatibilityFilter[];
    nativeTotals: AFM.INativeTotalItem[];
}

/**
 * Unwraps measure object
 *
 * @method unwrapSimpleMeasure
 * @param {AFM.IMeasure} item
 * @returns {AFM.ISimpleMeasure}
 */
export function unwrapSimpleMeasure(item: AFM.IMeasure): AFM.ISimpleMeasure {
    return (item.definition as AFM.ISimpleMeasureDefinition).measure;
}

/**
 * Unwraps popMeasure object
 *
 * @method unwrapPoPMeasure
 * @param {AFM.IMeasure} item
 * @returns {AFM.IPopMeasure}
 */
export function unwrapPoPMeasure(item: AFM.IMeasure): AFM.IPopMeasure {
    return (item.definition as AFM.IPopMeasureDefinition).popMeasure;
}

/**
 * Unwraps previousPeriodMeasure object
 *
 * @method unwrapPreviousPeriodMeasure
 * @param {AFM.IMeasure} item
 * @returns {AFM.IPreviousPeriodMeasure}
 */
export function unwrapPreviousPeriodMeasure(item: AFM.IMeasure): AFM.IPreviousPeriodMeasure {
    return (item.definition as AFM.IPreviousPeriodMeasureDefinition).previousPeriodMeasure;
}

/**
 * Unwraps arithmeticMeasure object
 *
 * @method unwrapArithmeticMeasure
 * @param {AFM.IMeasure} item
 * @returns {AFM.IArithmeticMeasure}
 */
export function unwrapArithmeticMeasure(item: AFM.IMeasure): AFM.IArithmeticMeasure {
    return (item.definition as AFM.IArithmeticMeasureDefinition).arithmeticMeasure;
}

/**
 * Normalize AFM
 *
 * @method normalizeAfm
 * @param {AFM.IAfm} afm
 * @returns {INormalizedAFM}
 */
export function normalizeAfm(afm: AFM.IAfm): INormalizedAFM {
    return {
        attributes: afm.attributes || [],
        measures: afm.measures || [],
        filters: afm.filters || [],
        nativeTotals: afm.nativeTotals || [],
    };
}

/**
 * Returns true if measure is a simple measure
 *
 * @method isSimpleMeasure
 * @param {AFM.IMeasure} item
 * @returns {boolean}
 */
export function isSimpleMeasure(item: AFM.IMeasure): boolean {
    return !!unwrapSimpleMeasure(item);
}

/**
 * Returns true if measure is PeriodOverPeriod
 *
 * @method isPoP
 * @param {AFM.IMeasure} item
 * @returns {boolean}
 */
export function isPoP(item: AFM.IMeasure): boolean {
    return !!unwrapPoPMeasure(item);
}

/**
 * Returns true if measure is previous period measure
 *
 * @method isPreviousPeriodMeasure
 * @param {AFM.IMeasure} item
 * @returns {boolean}
 */
export function isPreviousPeriodMeasure(item: AFM.IMeasure): boolean {
    return !!unwrapPreviousPeriodMeasure(item);
}

/**
 * Returns true if measure is arithmetic measure
 *
 * @method isArithmeticMeasure
 * @param {AFM.IMeasure} item
 * @returns {boolean}
 */
export function isArithmeticMeasure(item: AFM.IMeasure): boolean {
    return !!unwrapArithmeticMeasure(item);
}

/**
 * Returns true if filter is attributeFilter
 *
 * @method isAttributeFilter
 * @param {AFM.FilterItem} filter
 * @returns {boolean}
 * @deprecated use AFM.isAttributeFilter instead
 */
export function isAttributeFilter(filter: AFM.FilterItem): filter is AFM.AttributeFilterItem {
    return AFM.isAttributeFilter(filter);
}

/**
 * Returns true if filter is dateFilter
 *
 * @method isDateFilter
 * @param {AFM.CompatibilityFilter} filter
 * @returns {boolean}
 * @deprecated use AFM.isDateFilter instead
 */
export function isDateFilter(filter: AFM.CompatibilityFilter): filter is AFM.DateFilterItem {
    return AFM.isDateFilter(filter);
}

/**
 * Returns true if filter is negative attribute filter and has no selected elements,
 * meaning that this is "Select all"
 *
 * @method isAttributeFilterSelectAll
 * @param {AFM.FilterItem} filter
 * @returns {boolean}
 */
export function isAttributeFilterSelectAll(filter: AFM.FilterItem): boolean {
    if (AFM.isNegativeAttributeFilter(filter)) {
        return filter.negativeAttributeFilter.notIn.length === 0;
    }

    return false;
}

/**
 * Returns true if measure has dateFilters
 *
 * @method hasMetricDateFilters
 * @param {INormalizedAFM} normalizedAfm
 * @returns {boolean}
 */
export function hasMetricDateFilters(normalizedAfm: INormalizedAFM): boolean {
    return normalizedAfm.measures.some(measure => {
        if (isSimpleMeasure(measure)) {
            const filters = unwrapSimpleMeasure(measure).filters;
            return !!(filters && filters.some(AFM.isDateFilter));
        }
        return false;
    });
}

/**
 * Returns global date filters
 *
 * @method getGlobalDateFilters
 * @param {INormalizedAFM} normalizedAfm
 * @returns {AFM.DateFilterItem[]}
 */
export function getGlobalDateFilters(normalizedAfm: INormalizedAFM): AFM.DateFilterItem[] {
    return normalizedAfm.filters.filter(AFM.isDateFilter);
}

/**
 * Returns true if measure has filters
 *
 * @method hasFilters
 * @param {AFM.ISimpleMeasure} measure
 * @returns {boolean}
 */
export const hasFilters = (measure: AFM.ISimpleMeasure): boolean => {
    return !!(measure.filters && measure.filters.length > 0);
};

/**
 * Return date filters from AFM
 *
 * @method getMeasureDateFilters
 * @param {AFM.IAfm} normalizedAfm
 * @returns {AFM.DateFilterItem[]}
 */
export function getMeasureDateFilters(normalizedAfm: AFM.IAfm): AFM.DateFilterItem[] {
    return flatMap(normalizedAfm.measures, (item: AFM.IMeasure) => {
        const measure = unwrapSimpleMeasure(item);
        if (!measure || !hasFilters(measure)) {
            return [];
        }
        return (measure.filters || []).filter(AFM.isDateFilter);
    });
}

/**
 * Return true if AFM has global date filter
 *
 * @method hasGlobalDateFilter
 * @param {INormalizedAFM} afm
 * @returns {boolean}
 */
export function hasGlobalDateFilter(afm: INormalizedAFM): boolean {
    return afm.filters.some(AFM.isDateFilter);
}

/**
 * Return uri or identifier from ObjQualifier
 *
 * @method getId
 * @param {AFM.ObjQualifier} obj
 * @returns {string|null}
 */
export function getId(obj: AFM.ObjQualifier): string | null {
    if ((obj as AFM.IObjUriQualifier).uri) {
        return (obj as AFM.IObjUriQualifier).uri;
    }
    if ((obj as AFM.IObjIdentifierQualifier).identifier) {
        return (obj as AFM.IObjIdentifierQualifier).identifier;
    }
    return null;
}

/**
 * Returns date filter date dataset
 *
 * @method getDateFilterDateDataSet
 * @param {AFM.DateFilterItem} filter
 * @returns {AFM.ObjQualifier | null }
 */
export function getDateFilterDateDataSet(filter: AFM.DateFilterItem): AFM.ObjQualifier {
    if (AFM.isRelativeDateFilter(filter)) {
        return filter.relativeDateFilter.dataSet;
    }
    if (AFM.isAbsoluteDateFilter(filter)) {
        return filter.absoluteDateFilter.dataSet;
    }
    throw new Error("Unsupported type of date filter");
}

/**
 * Returns true if dateFilters dataSets match
 *
 * @method dateFiltersDataSetsMatch
 * @param {AFM.DateFilterItem} f1
 * @param {AFM.DateFilterItem} f2
 * @returns {AFM.ObjQualifier | null | boolean}
 */
export function dateFiltersDataSetsMatch(f1: AFM.DateFilterItem, f2: AFM.DateFilterItem) {
    const d1 = getDateFilterDateDataSet(f1);
    const d2 = getDateFilterDateDataSet(f2);
    return d1 && d2 && getId(d1) === getId(d2);
}

function isDateFilterAllTime(dateFilter: AFM.DateFilterItem): boolean {
    if (AFM.isRelativeDateFilter(dateFilter)) {
        return dateFilter.relativeDateFilter.granularity === ALL_TIME_GRANULARITY;
    }
    return false;
}

/**
 * Append attribute filters and date filter to afm
 *
 * Date filter handling:
 *      - Override if date filter has the same id
 *      - Add if date filter if date filter id is different
 *
 * Attribute filter handling:
 *      - Add all
 *
 * @method appendFilters
 * @param {AFM.IAfm} afm
 * @param {AFM.AttributeFilterItem[]} attributeFilters
 * @param {AFM.DateFilterItem} dateFilter
 * @param {AFM.IMeasureValueFilter[]} measureValueFilters
 * @return {AFM.IAfm}
 */
export function appendFilters(
    afm: AFM.IAfm,
    attributeFilters: AFM.AttributeFilterItem[],
    dateFilter?: AFM.DateFilterItem,
    measureValueFilters?: AFM.IMeasureValueFilter[],
): AFM.IAfm {
    const dateFilters: AFM.DateFilterItem[] =
        dateFilter && !isDateFilterAllTime(dateFilter) ? [dateFilter] : [];
    const afmDateFilter = afm.filters ? afm.filters.filter(AFM.isDateFilter)[0] : null;

    // all-time selected, need to delete date filter from filters
    let afmFilters = afm.filters || [];
    if (dateFilter && isDateFilterAllTime(dateFilter)) {
        afmFilters = afmFilters.filter(filter => {
            if (AFM.isDateFilter(filter)) {
                return !dateFiltersDataSetsMatch(filter, dateFilter);
            }
            return true;
        });
    }

    if (
        (afmDateFilter && dateFilter && !dateFiltersDataSetsMatch(afmDateFilter, dateFilter)) ||
        (afmDateFilter && !dateFilter)
    ) {
        dateFilters.push(afmDateFilter);
    }

    const afmNonDateFilters = afmFilters.filter(filter => !AFM.isDateFilter(filter));

    const filters = compact([
        ...afmNonDateFilters,
        ...attributeFilters,
        ...dateFilters,
        ...(measureValueFilters || []),
    ]);

    if (filters.length || (afm.filters && afm.filters.length)) {
        return {
            ...afm,
            filters,
        };
    }

    return afm;
}

/**
 * Returns true if AFM is executable
 *
 * @method isAfmExecutable
 * @param {AFM.IAfm} afm
 * @returns {boolean}
 */
export function isAfmExecutable(afm: AFM.IAfm) {
    const normalizedAfm = normalizeAfm(afm);
    return normalizedAfm.measures.length > 0 || normalizedAfm.attributes.length > 0;
}
