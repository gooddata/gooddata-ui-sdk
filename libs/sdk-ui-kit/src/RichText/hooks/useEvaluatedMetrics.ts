// (C) 2022-2025 GoodData Corporation

import {
    DataPoint,
    useBackend,
    useCancelablePromise,
    useExecutionDataView,
    useWorkspace,
} from "@gooddata/sdk-ui";
import {
    IFilter,
    IMeasure,
    IResultHeader,
    isMeasureDefinition,
    newMeasure,
    ObjRef,
} from "@gooddata/sdk-model";

import { ReferenceMap } from "../helpers/references.js";

export type EvaluatedMetric = {
    def: IMeasure;
    header: IResultHeader;
    ref: ObjRef;
    data: DataPoint;
};

export function useEvaluatedMetrics(references: ReferenceMap, filters: IFilter[], enabled: boolean) {
    const workspace = useWorkspace();
    const backend = useBackend();
    const metrics = getMeasures(references);

    const {
        status: executionStatus,
        result: executionResult,
        error: executionError,
    } = useExecutionDataView({
        execution:
            enabled && metrics.length > 0
                ? backend.workspace(workspace).execution().forItems(metrics, filters)
                : null,
    });

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

                headerItems[0][0].forEach((header, i) => {
                    const def = definition.measures[i];
                    const data = dataSeries[i].dataPoints()[0];

                    if (isMeasureDefinition(def.measure.definition)) {
                        items.push({
                            def,
                            data,
                            header,
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
        loading: executionStatus === "loading" || loadStatus === "loading" || loadStatus === "pending",
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
