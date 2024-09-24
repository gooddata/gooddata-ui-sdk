// (C) 2024 GoodData Corporation

import React from "react";
import {
    GenAIChatCreatedVisualization,
    idRef,
    MeasureAggregation,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";

export const useExecution = (vis: GenAIChatCreatedVisualization) => {
    return React.useMemo(() => {
        const dimensions = vis.dimensionality.map((d) => newAttribute(d.id));
        const metrics = vis.metrics.map((mf) => {
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
        });

        return {
            metrics,
            dimensions,
        };
    }, [vis]);
};
