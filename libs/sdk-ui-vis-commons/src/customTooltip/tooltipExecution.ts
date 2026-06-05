// (C) 2026 GoodData Corporation

import { type IExecutionFactory, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    type IExecutionDefinition,
    type IFilter,
    type IMeasure,
    MeasureGroupIdentifier,
    filterMeasureRef,
    idRef,
    isIdentifierRef,
    isLocalIdRef,
    isSimpleMeasure,
    measureItem,
    measureLocalId,
    newAttribute,
    newMeasure,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { REFERENCE_REGEX_MATCH } from "@gooddata/sdk-ui-kit";

interface IParsedReference {
    type: "metric" | "label";
    id: string;
}

function parseReferences(content: string): IParsedReference[] {
    const refs: IParsedReference[] = [];
    const seen = new Set<string>();

    // REFERENCE_REGEX_MATCH lives in sdk-ui-kit; match[3] is the kind
    // ("label" | "metric"), match[4] is the id.
    for (const match of content.matchAll(REFERENCE_REGEX_MATCH)) {
        const rawType = match[3].toLowerCase();
        // Synonyms like `measure` / `displayForm` aren't canonical here; let
        // them fall through so the rest of the pipeline doesn't silently treat
        // a `measure` ref as a metric.
        if (rawType !== "metric" && rawType !== "label") {
            continue;
        }
        const id = match[4];
        const key = `${rawType}/${id}`;
        if (!seen.has(key)) {
            seen.add(key);
            refs.push({ type: rawType, id });
        }
    }

    return refs;
}

function getChartMetricIds(definition: IExecutionDefinition): Set<string> {
    const ids = new Set<string>();
    for (const measure of definition.measures) {
        if (isSimpleMeasure(measure)) {
            const ref = measureItem(measure);
            if (ref && isIdentifierRef(ref)) {
                ids.add(ref.identifier);
            }
        }
    }
    return ids;
}

function getChartLabelIds(definition: IExecutionDefinition): Set<string> {
    // Only display-form identifier refs match. Refs in user content using a
    // URI ref or a parent attribute id miss the set, fall into the secondary
    // execution, and fail backend-side (one bad ref drops the whole call).
    const ids = new Set<string>();
    for (const attr of definition.attributes) {
        const ref = attr.attribute.displayForm;
        if (isIdentifierRef(ref)) {
            ids.add(ref.identifier);
        }
    }
    return ids;
}

/**
 * Chart measures that MVF/ranking filters depend on. Must be included in the
 * tooltip execution with their original localIds so the filter refs resolve and
 * tooltip values stay filter-consistent with the chart.
 */
function getFilterDependencyMeasures(
    filters: readonly IFilter[],
    chartMeasures: readonly IMeasure[],
): IMeasure[] {
    const neededLocalIds = new Set<string>();

    for (const filter of filters) {
        const measureRef = filterMeasureRef(filter);
        if (measureRef && isLocalIdRef(measureRef)) {
            neededLocalIds.add(measureRef.localIdentifier);
        }
    }

    if (neededLocalIds.size === 0) {
        return [];
    }

    return chartMeasures.filter((m) => neededLocalIds.has(measureLocalId(m)));
}

/**
 * Build tooltip-only measures for the given references (already filtered to
 * those not in the chart). Labels get a max+count pair (mirrors the RichText
 * widget pattern) so the lookup can render "(Multiple items)" when a label
 * resolves to >1 value per row.
 *
 * LocalId prefixes `tt_m_`, `tt_lv_`, `tt_lc_` are reserved — collision with
 * chart-side measure localIds would break filter-dependency reuse.
 */
function buildTooltipItems(refs: readonly IParsedReference[]): {
    measures: IMeasure[];
    labelCountMap: Record<string, string>;
    labelIdMap: Record<string, string>;
    measureIdMap: Record<string, string>;
} {
    const measures: IMeasure[] = [];
    const labelCountMap: Record<string, string> = {};
    const labelIdMap: Record<string, string> = {};
    const measureIdMap: Record<string, string> = {};
    let idx = 0;

    for (const ref of refs) {
        if (ref.type === "metric") {
            const localId = `tt_m_${idx++}`;
            measures.push(newMeasure(idRef(ref.id, "measure"), (m) => m.localId(localId)));
            measureIdMap[localId] = ref.id;
        } else {
            const valueLocalId = `tt_lv_${idx}`;
            const countLocalId = `tt_lc_${idx}`;
            idx++;

            measures.push(
                newMeasure(idRef(ref.id, "displayForm"), (m) => m.localId(valueLocalId).aggregation("max")),
            );
            measures.push(
                newMeasure(idRef(ref.id, "displayForm"), (m) => m.localId(countLocalId).aggregation("count")),
            );
            labelCountMap[valueLocalId] = countLocalId;
            labelIdMap[valueLocalId] = ref.id;
        }
    }

    return { measures, labelCountMap, labelIdMap, measureIdMap };
}

/**
 * Slicing attributes for the tooltip execution's row dimension. When
 * `slicingAttributeLocalIds` is passed, attributes are filtered AND reordered
 * to match the caller's list (geo layers exclude position attributes and rely
 * on the order being theirs).
 */
function getSlicingAttributes(
    definition: IExecutionDefinition,
    slicingAttributeLocalIds?: readonly string[],
): IAttribute[] {
    if (!slicingAttributeLocalIds) {
        return definition.attributes.map((attr) =>
            newAttribute(attr.attribute.displayForm, (a) => a.localId(attr.attribute.localIdentifier)),
        );
    }

    const byLocalId = new Map<string, IAttribute>(
        definition.attributes.map((a) => [a.attribute.localIdentifier, a]),
    );

    const out: IAttribute[] = [];
    for (const localId of slicingAttributeLocalIds) {
        const attr = byLocalId.get(localId);
        if (attr) {
            out.push(newAttribute(attr.attribute.displayForm, (a) => a.localId(localId)));
        }
    }
    return out;
}

/**
 * Maps used by `buildLookupTable` to interpret the execution result.
 *
 * @internal
 */
export interface ITooltipExecutionMeta {
    /** value localId → count localId, for "Multiple items" detection. */
    labelCountMap: Record<string, string>;
    /** tooltip metric localId → LDM measure identifier. */
    measureIdMap: Record<string, string>;
    /** label value localId → LDM label identifier. */
    labelIdMap: Record<string, string>;
}

/**
 * Prepared tooltip execution paired with the meta needed to interpret its result.
 * Carry them together — meta from one call mis-interprets results from another.
 *
 * @internal
 */
export interface ITooltipExecutionBundle {
    execution: IPreparedExecution;
    meta: ITooltipExecutionMeta;
}

/**
 * A tooltip execution plan: one batched execution for all external references,
 * plus per-reference bundles used as an isolation fallback. When the batch
 * rejects (e.g. a single invalid reference 400s the whole AFM), the consumer
 * re-runs the per-reference bundles so one bad reference can't suppress the
 * rest. `perRef` is a thunk: the bundles are built lazily, only when the batch
 * fails, so consumers that never fan out (e.g. geo) pay nothing for it.
 *
 * @internal
 */
export interface ITooltipExecution {
    batch: ITooltipExecutionBundle;
    perRef: () => readonly ITooltipExecutionBundle[];
}

/**
 * @internal
 */
export interface IBuildTooltipExecutionOptions {
    /**
     * LocalIdentifiers from `definition.attributes` to use as the row dimension,
     * in the desired order. Omit to use all attributes in definition order
     * (Highcharts default). Geo passes an explicit list to drop position attrs.
     */
    slicingAttributeLocalIds?: readonly string[];
}

/**
 * Builds a single execution bundle for the given external references (slicing
 * attributes + tooltip measures + filter-dependency measures). Returns `null`
 * when there are no measures to fetch.
 */
function buildBundle(
    executionFactory: IExecutionFactory,
    chartDefinition: IExecutionDefinition,
    externalRefs: readonly IParsedReference[],
    options?: IBuildTooltipExecutionOptions,
): ITooltipExecutionBundle | null {
    const { measures, labelCountMap, labelIdMap, measureIdMap } = buildTooltipItems(externalRefs);

    if (measures.length === 0) {
        return null;
    }

    const chartAttrs = getSlicingAttributes(chartDefinition, options?.slicingAttributeLocalIds);

    const filterDepMeasures = getFilterDependencyMeasures(chartDefinition.filters, chartDefinition.measures);

    const allItems = [...chartAttrs, ...measures, ...filterDepMeasures];
    const attrLocalIds = chartAttrs.map((a) => a.attribute.localIdentifier);

    let execution = executionFactory
        .forItems(allItems, chartDefinition.filters)
        .withDimensions(...newTwoDimensional(attrLocalIds, [MeasureGroupIdentifier]));

    if (chartDefinition.executionConfig) {
        execution = execution.withExecConfig(chartDefinition.executionConfig);
    }

    return {
        execution,
        meta: { labelCountMap, measureIdMap, labelIdMap },
    };
}

/**
 * Returns `null` when the content has no references or all references are
 * already in the chart (resolvable from drill data without a secondary call).
 * Otherwise returns the batched execution plus per-reference bundles for the
 * fan-out fallback (see {@link ITooltipExecution}).
 *
 * @internal
 */
export function buildTooltipExecution(
    executionFactory: IExecutionFactory,
    chartDefinition: IExecutionDefinition,
    tooltipContent: string,
    options?: IBuildTooltipExecutionOptions,
): ITooltipExecution | null {
    const refs = parseReferences(tooltipContent);
    if (refs.length === 0) {
        return null;
    }

    const chartMetricIds = getChartMetricIds(chartDefinition);
    const chartLabelIds = getChartLabelIds(chartDefinition);

    // References not already resolvable from the chart's own drill data.
    const externalRefs = refs.filter(
        (ref) =>
            (ref.type === "metric" && !chartMetricIds.has(ref.id)) ||
            (ref.type === "label" && !chartLabelIds.has(ref.id)),
    );

    const batch = buildBundle(executionFactory, chartDefinition, externalRefs, options);
    if (!batch) {
        return null;
    }

    // Lazy: built only on batch failure (the Highcharts fan-out); geo never calls it.
    const perRef = () =>
        externalRefs
            .map((ref) => buildBundle(executionFactory, chartDefinition, [ref], options))
            .filter((bundle): bundle is ITooltipExecutionBundle => bundle !== null);

    return { batch, perRef };
}
