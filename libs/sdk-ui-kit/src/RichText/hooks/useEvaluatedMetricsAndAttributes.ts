// (C) 2022-2026 GoodData Corporation

import {
    type IExecutionConfig,
    type IFilter,
    type IMeasure,
    type IResultHeader,
    type ObjRef,
    isComputedAttributeRef,
    isMeasureDefinition,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";
import {
    type DataPoint,
    useBackend,
    useCancelablePromise,
    useExecutionDataView,
    useWorkspace,
} from "@gooddata/sdk-ui";

import { type ReferenceMap } from "../helpers/references.js";

/**
 * How a reference's "is there more than one value?" question is answered, per value measure.
 *
 * `count` is a DISTINCT count, so `> 1` means several values. `min` answers the same question by
 * comparison - used where the backend cannot count the item, see {@link getLabels}.
 */
type MultiplicityProbes = Record<string, { localId: string; kind: "count" | "min" }>;

export type EvaluatedMetric = {
    def: IMeasure;
    header: IResultHeader;
    ref: ObjRef;
    data: DataPoint;
    count: number;
    format?: string;
};

export function useEvaluatedMetricsAndAttributes(
    references: ReferenceMap,
    filters: IFilter[],
    config: IExecutionConfig & { enabled: boolean; isFiltersLoading?: boolean },
) {
    const workspace = useWorkspace();
    const backend = useBackend();
    const metrics = getMeasures(references);
    const { metrics: labels, probes } = getLabels(references);

    const items = [...metrics, ...labels];
    const { enabled, isFiltersLoading, ...execConfig } = config;

    const {
        status: executionStatus,
        result: executionResult,
        error: executionError,
    } = useExecutionDataView(
        {
            execution:
                enabled && items.length > 0 && !isFiltersLoading && backend && workspace
                    ? backend
                          .workspace(workspace)
                          .execution()
                          .forItems(items, filters)
                          .withExecConfig(execConfig)
                    : undefined,
        },
        [execConfig.timestamp, execConfig.dataSamplingPercentage, execConfig.timezone, isFiltersLoading],
    );

    const {
        status: loadStatus,
        result: loadResult,
        error: loadError,
    } = useCancelablePromise(
        {
            promise: async () => {
                if (!executionResult) {
                    return [];
                }

                const headerItems = executionResult.meta().allHeaders();
                const dataSeries = executionResult.data().series().toArray();
                const definition = executionResult.definition;
                const items: Array<EvaluatedMetric> = [];

                const skippedLocalIds = Object.values(probes).map((probe) => probe.localId);
                const valueLocalIds = Object.keys(probes);

                const relatedHeaders = headerItems[0][0];
                relatedHeaders.forEach((header, i) => {
                    const data = dataSeries[i].dataPoints()[0];
                    const def = data.seriesDesc.measureDefinition;
                    const descriptor = data.seriesDesc.measureDescriptor;

                    // Skip count measures, we want merge it with value measures
                    if (skippedLocalIds.includes(def.measure.localIdentifier)) {
                        return;
                    }

                    // Normal measure
                    if (
                        isMeasureDefinition(def.measure.definition) &&
                        !valueLocalIds.includes(def.measure.localIdentifier)
                    ) {
                        items.push({
                            def,
                            data,
                            header,
                            count: 1,
                            format: descriptor.measureHeaderItem.format,
                            ref: def.measure.definition.measureDefinition.item,
                        });
                    }

                    // Attribute measure, with its multiplicity probe as next
                    if (
                        isMeasureDefinition(def.measure.definition) &&
                        valueLocalIds.includes(def.measure.localIdentifier)
                    ) {
                        const probe = probes[def.measure.localIdentifier];
                        const probeIndex = definition.measures.findIndex(
                            (d) => d.measure.localIdentifier === probe.localId,
                        );
                        const probeData = dataSeries[probeIndex]?.dataPoints()[0] ?? undefined;

                        items.push({
                            def,
                            data,
                            header,
                            format: descriptor.measureHeaderItem.format,
                            // `count` reads as: 0 none, 1 one value, more than one several. A min
                            // probe cannot see "none" - an absent value already surfaces as an
                            // empty raw value - so it only distinguishes one from several.
                            count:
                                probe.kind === "count"
                                    ? parseInt((probeData?.rawValue ?? "0").toString())
                                    : probeData?.rawValue === data.rawValue
                                      ? 1
                                      : 2,
                            ref: def.measure.definition.measureDefinition.item,
                        });
                    }
                });
                return items;
            },
        },
        [executionResult],
    );

    return {
        loading:
            isFiltersLoading ||
            executionStatus === "loading" ||
            loadStatus === "loading" ||
            loadStatus === "pending",
        error: executionError || loadError,
        result: loadResult,
    };
}

function getMeasures(references: ReferenceMap) {
    const metrics = Object.values(references)
        .map(({ type, ref }) => (type === "measure" ? ref : null))
        .filter(Boolean);

    return metrics.map((ref, i) => {
        return newMeasure(ref!, (m) => {
            m.localId(`m_${i}`);
            return m;
        });
    });
}

/**
 * The measures resolving attribute-shaped references: `max` for the value, and `count` alongside it
 * to tell a single value from several.
 *
 * A computed attribute is referenced like any other attribute - its ref goes on the display form
 * slot, typed `computedAttribute` - but it is only asked for its value, see below.
 *
 * @internal
 */
export function getLabels(references: ReferenceMap) {
    const attributes = Object.values(references)
        .map(({ type, ref }) =>
            type === "displayForm" || type === "attribute" || type === "computedAttribute" ? ref : null,
        )
        .filter(Boolean);

    const items = attributes.map((ref, i) => {
        return newAttribute(ref!, (m) => {
            m.localId(`m_${i}`);
            return m;
        });
    });

    const probes: MultiplicityProbes = {};
    const metrics = items.reduce((acc: IMeasure[], attr, i) => {
        const valueLocalId = `m_max_${i}`;
        const value = newMeasure(attr.attribute.displayForm, (m) => {
            m.localId(valueLocalId);
            m.aggregation("max");
            return m;
        });

        // A computed attribute cannot be counted without a slicing context: it is functionally
        // determined by the attributes it is computed on, and its own dataset is synthetic, so
        // the backend has no single witness to count over and rejects the whole execution with
        // "Ambiguous context for count" - which would take every other reference in the widget
        // with it. Its minimum answers the same question: `count` here compiles to a DISTINCT
        // count, so "more than one value" is precisely "the smallest differs from the largest".
        const useMin = isComputedAttributeRef(attr.attribute.displayForm);
        const probeLocalId = useMin ? `m_min_${i}` : `m_count_${i}`;

        probes[valueLocalId] = { localId: probeLocalId, kind: useMin ? "min" : "count" };
        return [
            ...acc,
            value,
            newMeasure(attr.attribute.displayForm, (m) => {
                m.localId(probeLocalId);
                m.aggregation(useMin ? "min" : "count");
                return m;
            }),
        ];
    }, []);

    return {
        probes,
        metrics,
    };
}
