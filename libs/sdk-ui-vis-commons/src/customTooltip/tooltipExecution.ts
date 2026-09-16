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
    isComputedAttributeRef,
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

import { type ICustomTooltipConfig, computedAttributeKey, labelKey } from "./types.js";

interface IParsedReference {
    type: "metric" | "label" | "computed_attribute";
    id: string;
}

// Keyed by the prefix lowercased, as the regex matches it case-insensitively.
const CANONICAL_TYPE: Record<string, IParsedReference["type"]> = {
    metric: "metric",
    label: "label",
    computed_attribute: "computed_attribute",
};

function parseReferences(content: string): IParsedReference[] {
    const refs: IParsedReference[] = [];
    const seen = new Set<string>();

    // REFERENCE_REGEX_MATCH lives in sdk-ui-kit; match[3] is the kind
    // ("label" | "metric" | "computed_attribute"), match[4] is the id.
    for (const match of content.matchAll(REFERENCE_REGEX_MATCH)) {
        const type = CANONICAL_TYPE[match[3].toLowerCase()];
        // Synonyms like `measure` / `displayForm` aren't canonical here; let
        // them fall through so the rest of the pipeline doesn't silently treat
        // a `measure` ref as a metric.
        if (!type) {
            continue;
        }
        const id = match[4];
        const key = `${type}/${id}`;
        if (!seen.has(key)) {
            seen.add(key);
            refs.push({ type, id });
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

/**
 * The chart's attribute-shaped ids, kept apart by object type. A computed attribute's own ref is
 * what sits on the display form slot, so without the split a label and a computed attribute of the
 * same id would be indistinguishable here - and a reference to one would be answered by the other.
 *
 * Only identifier refs match. Refs in user content using a URI ref or a parent attribute id miss
 * the set, fall into the secondary execution, and fail backend-side (one bad ref drops the whole
 * call).
 */
function getChartAttributeIds(definition: IExecutionDefinition): {
    labelIds: Set<string>;
    computedAttributeIds: Set<string>;
} {
    const labelIds = new Set<string>();
    const computedAttributeIds = new Set<string>();
    for (const attr of definition.attributes) {
        const ref = attr.attribute.displayForm;
        if (!isIdentifierRef(ref)) {
            continue;
        }
        (isComputedAttributeRef(ref) ? computedAttributeIds : labelIds).add(ref.identifier);
    }
    return { labelIds, computedAttributeIds };
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
 * those not in the chart). Labels and computed attributes get a max+count pair
 * (mirrors the RichText widget pattern) so the lookup can render "(Multiple items)" when a label
 * resolves to >1 value per row.
 *
 * LocalId prefixes `tt_m_`, `tt_lv_`, `tt_lc_` are reserved — collision with
 * chart-side measure localIds would break filter-dependency reuse.
 */
function buildTooltipItems(refs: readonly IParsedReference[]): {
    measures: IMeasure[];
    labelCountMap: Record<string, string>;
    attributeKeyMap: Record<string, string>;
    measureIdMap: Record<string, string>;
} {
    const measures: IMeasure[] = [];
    const labelCountMap: Record<string, string> = {};
    const attributeKeyMap: Record<string, string> = {};
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

            // A computed attribute has no labels on the backend and is referenced by its own type;
            // both aggregations below are supported over it.
            const isComputedAttribute = ref.type === "computed_attribute";
            const attributeRef = idRef(ref.id, isComputedAttribute ? "computedAttribute" : "displayForm");

            measures.push(newMeasure(attributeRef, (m) => m.localId(valueLocalId).aggregation("max")));
            measures.push(newMeasure(attributeRef, (m) => m.localId(countLocalId).aggregation("count")));
            labelCountMap[valueLocalId] = countLocalId;
            attributeKeyMap[valueLocalId] = isComputedAttribute
                ? computedAttributeKey(ref.id)
                : labelKey(ref.id);
        }
    }

    return { measures, labelCountMap, attributeKeyMap, measureIdMap };
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
    /**
     * Attribute value localId → the lookup key its value is published under. A key rather than a
     * bare id, because a label and a computed attribute may share an identifier and each belongs
     * in its own namespace - see {@link @gooddata/sdk-ui-vis-commons#computedAttributeKey}.
     */
    attributeKeyMap: Record<string, string>;
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
 * rest. Both Highcharts and geo fan out this way. `perRef` is a thunk: the
 * bundles are built lazily, only when the batch fails, so the success path
 * pays nothing for it.
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
    const { measures, labelCountMap, attributeKeyMap, measureIdMap } = buildTooltipItems(externalRefs);

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
        meta: { labelCountMap, measureIdMap, attributeKeyMap },
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
    const { labelIds, computedAttributeIds } = getChartAttributeIds(chartDefinition);

    // References not already resolvable from the chart's own drill data. Each type is matched
    // against the ids of its own type only: an id may name a label and a computed attribute at
    // once, and answering one from the other would show a value belonging to a different object.
    const inChartIds: Record<IParsedReference["type"], Set<string>> = {
        metric: chartMetricIds,
        label: labelIds,
        computed_attribute: computedAttributeIds,
    };
    const externalRefs = refs.filter((ref) => !inChartIds[ref.type].has(ref.id));

    const batch = buildBundle(executionFactory, chartDefinition, externalRefs, options);
    if (!batch) {
        return null;
    }

    // Lazy: built only on batch failure (Highcharts and geo both fan out); the
    // success path never invokes it.
    const perRef = () =>
        externalRefs
            .map((ref) => buildBundle(executionFactory, chartDefinition, [ref], options))
            .filter((bundle): bundle is ITooltipExecutionBundle => bundle !== null);

    return { batch, perRef };
}

/**
 * Variant of {@link buildTooltipExecution} gated by the customTooltip config: this is the
 * canonical "should a tooltip execution exist at all" check (enabled + non-empty string
 * content), so call sites don't re-implement it. Returns `undefined` when the tooltip is
 * off, has no usable content, or {@link buildTooltipExecution} itself yields nothing.
 *
 * @internal
 */
export function buildTooltipExecutionFromConfig(
    executionFactory: IExecutionFactory,
    chartDefinition: IExecutionDefinition,
    customTooltip: ICustomTooltipConfig | undefined,
    options?: IBuildTooltipExecutionOptions,
): ITooltipExecution | undefined {
    const { enabled, content } = customTooltip ?? {};
    // The config may come from untyped visualization properties, so guard the content type too.
    if (!enabled || typeof content !== "string" || !content) {
        return undefined;
    }

    return buildTooltipExecution(executionFactory, chartDefinition, content, options) ?? undefined;
}
