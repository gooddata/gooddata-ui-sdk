// (C) 2024 GoodData Corporation

import React from "react";
import {
    GenAIChatCreatedVisualization,
    idRef,
    MeasureAggregation,
    MeasureGroupIdentifier,
    newAttribute,
    newMeasure,
    newTwoDimensional,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

export const useExecution = (vis: GenAIChatCreatedVisualization) => {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    return React.useMemo(() => {
        const attributes = vis.dimensionality.map((d) => newAttribute(d.id));

        return backend
            .workspace(workspace)
            .execution()
            .forItems([
                ...vis.metrics.map((mf) => {
                    switch (mf.type) {
                        case "fact":
                            return newMeasure(mf.id, (m) =>
                                m.aggregation(mf.aggFunction.toLowerCase() as MeasureAggregation),
                            );
                        case "metric":
                            return newMeasure(idRef(mf.id, "measure"));
                        case "attribute":
                            return newMeasure(mf.id, (m) => m.aggregation("count"));
                    }
                }),
                ...attributes,
            ])
            .withDimensions(...newTwoDimensional(attributes, [MeasureGroupIdentifier]));
    }, [backend, workspace, vis]);
};
