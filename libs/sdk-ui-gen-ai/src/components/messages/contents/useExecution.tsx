// (C) 2024 GoodData Corporation

import React from "react";
import {
    idRef,
    MeasureAggregation,
    newAttribute,
    newMeasure,
    IGenAIVisualization,
} from "@gooddata/sdk-model";

export const useExecution = (vis?: IGenAIVisualization) => {
    return React.useMemo(() => {
        const dimensions = vis?.dimensionality?.map((d) => newAttribute(d.id)) ?? [];
        const metrics =
            vis?.metrics?.map((mf) => {
                switch (mf.type) {
                    case "fact":
                        return newMeasure(idRef(mf.id, "fact"), (m) => {
                            if (mf.aggFunction) {
                                return m.aggregation(mf.aggFunction.toLowerCase() as MeasureAggregation);
                            }

                            return m;
                        });
                    case "metric":
                        return newMeasure(idRef(mf.id, "measure"));
                    case "attribute":
                        return newMeasure(idRef(mf.id, "attribute"), (m) => m.aggregation("count"));
                }
            }) ?? [];

        return {
            metrics,
            dimensions,
        };
    }, [vis]);
};
