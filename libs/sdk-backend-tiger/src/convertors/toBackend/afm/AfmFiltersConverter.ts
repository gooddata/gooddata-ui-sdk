// (C) 2007-2026 GoodData Corporation

import { compact } from "lodash-es";

import { type FilterDefinition, type MeasureItem } from "@gooddata/api-client-tiger";
import {
    type IFilter,
    type IMeasure,
    type IMeasureDefinition,
    type Identifier,
    type ObjRefInScope,
    filterMeasureRef,
    isLocalIdRef,
    isMeasureValueFilter,
    isRankingFilter,
    localIdRef,
    measureDoesComputeRatio,
    measureLocalId,
    modifySimpleMeasure,
} from "@gooddata/sdk-model";

import { convertFilter, newFilterWithApplyOnResult } from "./FilterConverter.js";
import { convertMeasure } from "./MeasureConverter.js";

type ComputeRatioMeasureNumerators = Map<Identifier, IMeasure<IMeasureDefinition>>;

/**
 * Return the actual measure which should be used for measure based filtering, together with the info how the
 * corresponding filter should be applied (`undefined` means default application).
 */
function getActualFilteredMeasureInfo(
    computeRatioMeasureNumerators: ComputeRatioMeasureNumerators,
    measure: ObjRefInScope,
): [ObjRefInScope, boolean?] {
    const updatedFilteredMeasure = isLocalIdRef(measure)
        ? computeRatioMeasureNumerators.get(measure.localIdentifier)
        : undefined;
    return updatedFilteredMeasure === undefined
        ? [measure, undefined]
        : [localIdRef(measureLocalId(updatedFilteredMeasure)), false];
}

/**
 * Find those ratio measures which are used in some measure based filter. For each such measure create its updated
 * version with ratio computation off and with new local identifier. These new auxiliary measures are meant to be used
 * as actual base for their respective filters which should be applied on source data (instead of the result) so that
 * both numerator and denominator of the ratio measure are actually filtered.
 *
 * Return mapping from the original local identifiers to new auxiliary measures.
 */
function determineComputeRatioMeasureNumerators(
    afmMeasures: IMeasure[],
    filters: IFilter[],
): ComputeRatioMeasureNumerators {
    const filteredLocalMeasures = filters
        .map(filterMeasureRef)
        .filter(isLocalIdRef)
        .map((m) => m.localIdentifier);
    return new Map(
        afmMeasures
            .filter(measureDoesComputeRatio)
            .filter((m) => filteredLocalMeasures.includes(measureLocalId(m)))
            .map((measure) => {
                const measureNumerator = modifySimpleMeasure(measure, (m) => m.noRatio().defaultLocalId());
                return [measureLocalId(measure), measureNumerator];
            }),
    );
}

/**
 * Converts internal `afmFilters` to backend AFM filters. Those filters that reference some compute ratio measure from
 * `afmMeasures` will be handled specially (see `determineComputeRatioMeasureNumerators`) and will also lead to `auxMeasures`
 * being generated (intended to be used by the callers in crafting the final backend AFM).
 */
export function convertAfmFilters(
    afmMeasures: IMeasure[],
    afmFilters: IFilter[],
    keepEmptyAttributeFilters: boolean = false,
): { filters: FilterDefinition[]; auxMeasures: MeasureItem[] } {
    const computeRatioMeasureNumerators = determineComputeRatioMeasureNumerators(afmMeasures, afmFilters);
    const transformedFilters = afmFilters.map((filter) => {
        // TODO Improve accessors and factory methods for measure based filters.
        if (isMeasureValueFilter(filter)) {
            const [filteredMeasure, applyOnResult] = getActualFilteredMeasureInfo(
                computeRatioMeasureNumerators,
                filter.measureValueFilter.measure,
            );
            const { dimensionality, ...restMeasureValueFilter } = filter.measureValueFilter;
            const dimensionalityProp = dimensionality?.length ? { dimensionality } : {};
            const transformedFilter = {
                measureValueFilter: {
                    ...restMeasureValueFilter,
                    measure: filteredMeasure,
                    ...dimensionalityProp,
                },
            };
            return newFilterWithApplyOnResult(transformedFilter, applyOnResult);
        } else if (isRankingFilter(filter)) {
            const [filteredMeasure, applyOnResult] = getActualFilteredMeasureInfo(
                computeRatioMeasureNumerators,
                filter.rankingFilter.measure,
            );
            const { attributes, operator, value } = filter.rankingFilter;
            const transformedFilter = {
                rankingFilter: { measure: filteredMeasure, attributes, operator, value },
            };
            return newFilterWithApplyOnResult(transformedFilter, applyOnResult);
        } else {
            return filter;
        }
    });
    return {
        filters: compact(transformedFilters.map((f) => convertFilter(f, keepEmptyAttributeFilters))),
        auxMeasures: Array.from(computeRatioMeasureNumerators.values()).map(convertMeasure),
    };
}
