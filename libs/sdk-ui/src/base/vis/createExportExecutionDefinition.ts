// (C) 2026 GoodData Corporation

import { isEqual } from "lodash-es";

import {
    type IExecutionDefinition,
    type IFilter,
    type IInsightDefinition,
    type ObjRefInScope,
    attributeLocalId,
    defWithDimensions,
    defaultDimensionsGenerator,
    isLocalIdRef,
    isMeasureValueFilter,
    isRankingFilter,
    localIdRef,
    measureLocalId,
    measureValueFilterDimensionality,
    measureValueFilterMeasure,
    mergeFilters,
    newDefForInsight,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface ICreateExportExecutionDefinitionOptions {
    /**
     * When true, the insight's own filters are merged into the definition on top of the base
     * definition's filters (base filters win date/measure-value conflicts), and measure-based
     * filters (measure value/ranking) referencing local identifiers absent from the definition
     * are dropped. Used by per-layer geo exports, where a layer's filters are not part of the
     * base (root) execution and the base may carry filters bound to another layer's measures.
     * By default the insight filters are ignored and the base definition's filters are kept as-is.
     */
    includeInsightFilters?: boolean;

    /**
     * Maps original attribute local ids to their replacements in the insight (e.g. the geo label
     * swapped for its default display form under a new local id). Merged filters referencing the
     * original local ids are remapped before the applicability check, so they are neither dropped
     * nor left pointing at attributes absent from the definition. Only applied together with
     * `includeInsightFilters`.
     */
    attributeLocalIdMapping?: Record<string, string>;
}

/**
 * Mirrors the render-path routing (`routeLocalIdRefFiltersToLayers` in sdk-ui-ext): a measure
 * value/ranking filter referencing local identifiers applies only to an execution that contains
 * all of those local identifiers; all other filters pass through.
 */
function createLocalIdFilterPredicate(definition: IExecutionDefinition): (filter: IFilter) => boolean {
    const attributeLocalIds = new Set(definition.attributes.map(attributeLocalId));
    const measureLocalIds = new Set(definition.measures.map(measureLocalId));

    return (filter) => {
        if (isMeasureValueFilter(filter)) {
            const measure = measureValueFilterMeasure(filter);
            const dimensionality = measureValueFilterDimensionality(filter) ?? [];
            const hasMissingMeasure = isLocalIdRef(measure) && !measureLocalIds.has(measure.localIdentifier);
            const hasMissingDimensionality = dimensionality
                .filter(isLocalIdRef)
                .some((ref) => !attributeLocalIds.has(ref.localIdentifier));
            return !hasMissingMeasure && !hasMissingDimensionality;
        }

        if (isRankingFilter(filter)) {
            const { measure, attributes = [] } = filter.rankingFilter;
            const hasMissingMeasure = isLocalIdRef(measure) && !measureLocalIds.has(measure.localIdentifier);
            const hasMissingAttributes = attributes
                .filter(isLocalIdRef)
                .some((ref) => !attributeLocalIds.has(ref.localIdentifier));
            return !hasMissingMeasure && !hasMissingAttributes;
        }

        return true;
    };
}

function remapFilterAttributeLocalIds(filters: IFilter[], mapping: Record<string, string>): IFilter[] {
    const remapRef = (ref: ObjRefInScope): ObjRefInScope =>
        isLocalIdRef(ref) && mapping[ref.localIdentifier] ? localIdRef(mapping[ref.localIdentifier]) : ref;
    const needsRemap = (refs: ObjRefInScope[] | undefined) =>
        refs?.some((ref) => isLocalIdRef(ref) && mapping[ref.localIdentifier]) ?? false;

    return filters.map((filter) => {
        if (isMeasureValueFilter(filter)) {
            const dimensionality = measureValueFilterDimensionality(filter);
            if (dimensionality && needsRemap(dimensionality)) {
                return {
                    measureValueFilter: {
                        ...filter.measureValueFilter,
                        dimensionality: dimensionality.map(remapRef),
                    },
                };
            }
        }

        if (isRankingFilter(filter)) {
            const { attributes } = filter.rankingFilter;
            if (attributes && needsRemap(attributes)) {
                return {
                    rankingFilter: {
                        ...filter.rankingFilter,
                        attributes: attributes.map(remapRef),
                    },
                };
            }
        }

        return filter;
    });
}

/**
 * @internal
 */
export function createExportExecutionDefinition(
    insight: IInsightDefinition,
    workspace: string,
    baseExecutionDefinition: IExecutionDefinition,
    options?: ICreateExportExecutionDefinitionOptions,
): IExecutionDefinition {
    const exportDefinitionTemplate = defWithDimensions(
        newDefForInsight(workspace, insight),
        defaultDimensionsGenerator,
    );

    const buildMergedFilters = (): IFilter[] => {
        const mergedFilters = mergeFilters(exportDefinitionTemplate.filters, baseExecutionDefinition.filters);
        const remappedFilters = options?.attributeLocalIdMapping
            ? remapFilterAttributeLocalIds(mergedFilters, options.attributeLocalIdMapping)
            : mergedFilters;
        // the insight and the base definition typically both carry the root insight's filters
        // (mergeFilters concatenates attribute/ranking filters), so drop exact duplicates
        const dedupedFilters = remappedFilters.filter(
            (filter, index) => remappedFilters.findIndex((candidate) => isEqual(candidate, filter)) === index,
        );
        return dedupedFilters.filter(createLocalIdFilterPredicate(exportDefinitionTemplate));
    };

    return {
        ...baseExecutionDefinition,
        buckets: exportDefinitionTemplate.buckets,
        attributes: exportDefinitionTemplate.attributes,
        measures: exportDefinitionTemplate.measures,
        sortBy: exportDefinitionTemplate.sortBy,
        dimensions: exportDefinitionTemplate.dimensions,
        ...(options?.includeInsightFilters ? { filters: buildMergedFilters() } : {}),
    };
}
