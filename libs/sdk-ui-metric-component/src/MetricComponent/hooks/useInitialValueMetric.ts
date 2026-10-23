// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { isEqual } from "lodash-es";

import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useInitialValueMetric(
    metric: IMeasureDef,
): [IMeasureDef, Dispatch<SetStateAction<IMeasureDef>>] {
    const [initialValueMetric, setInitialValueMetric] = useState(metric);

    useEffect(() => {
        if (!isEqual(initialValueMetric, metric)) {
            setInitialValueMetric(metric);
        }
    }, [initialValueMetric, metric]);

    return [initialValueMetric, setInitialValueMetric];
}
