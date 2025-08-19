// (C) 2022-2025 GoodData Corporation

import {
    IExecutionConfig,
    IFilter,
    IMeasure,
    IResultHeader,
    ObjRef,
    isMeasureDefinition,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";
import {
    DataPoint,
    useBackend,
    useCancelablePromise,
    useExecutionDataView,
    useWorkspace,
} from "@gooddata/sdk-ui";

import { ReferenceMap } from "../helpers/references.js";

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
    const { metrics: labels, countMap } = getLabels(references);

    const items = [...metrics, ...labels];
    const { enabled, isFiltersLoading, ...execConfig } = config;

    const {
        status: executionStatus,
        result: executionResult,
        error: executionError,
    } = useExecutionDataView(
        {
            execution:
                enabled && items.length > 0 && !isFiltersLoading
                    ? backend
                          .workspace(workspace)
                          .execution()
                          .forItems(items, filters)
                          .withExecConfig(execConfig)
                    : null,
        },
        [execConfig.timestamp, execConfig.dataSamplingPercentage, isFiltersLoading],
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

                const skippedLocalIds = Object.values(countMap);
                const valueLocalIds = Object.keys(countMap);

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

                    // Attribute measure with count as next
                    if (
                        isMeasureDefinition(def.measure.definition) &&
                        valueLocalIds.includes(def.measure.localIdentifier)
                    ) {
                        const countLocalId = countMap[def.measure.localIdentifier];
                        const countIndex = definition.measures.findIndex(
                            (d) => d.measure.localIdentifier === countLocalId,
                        );
                        const countData = dataSeries[countIndex]?.dataPoints()[0] ?? undefined;

                        items.push({
                            def,
                            data,
                            header,
                            format: descriptor.measureHeaderItem.format,
                            count: parseInt((countData?.rawValue ?? "0").toString()),
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
        return newMeasure(ref, (m) => {
            m.localId(`m_${i}`);
            return m;
        });
    });
}

function getLabels(references: ReferenceMap) {
    const attributes = Object.values(references)
        .map(({ type, ref }) => (type === "displayForm" || type === "attribute" ? ref : null))
        .filter(Boolean);

    const items = attributes.map((ref, i) => {
        return newAttribute(ref, (m) => {
            m.localId(`m_${i}`);
            return m;
        });
    });

    const countMap: Record<string, string> = {};
    const metrics = items.reduce((acc: IMeasure[], attr, i) => {
        const valueLocalId = `m_max_${i}`;
        const countLocalId = `m_count_${i}`;

        countMap[valueLocalId] = countLocalId;
        return [
            ...acc,
            newMeasure(attr.attribute.displayForm, (m) => {
                m.localId(valueLocalId);
                m.aggregation("max");
                return m;
            }),
            newMeasure(attr.attribute.displayForm, (m) => {
                m.localId(countLocalId);
                m.aggregation("count");
                return m;
            }),
        ];
    }, []);

    return {
        countMap,
        metrics,
    };
}
