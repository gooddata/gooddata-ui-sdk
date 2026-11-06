// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { _isEqual } from "@gooddata/util";

import { type IMeasureDef } from "../metric/metricHelpers.js";

export function useInitialValueMetric(
    metric: IMeasureDef,
): [IMeasureDef, Dispatch<SetStateAction<IMeasureDef>>] {
    const [initialValueMetric, setInitialValueMetric] = useState(metric);

    useEffect(() => {
        if (!_isEqual(initialValueMetric, metric)) {
            setInitialValueMetric(metric);
        }
    }, [initialValueMetric, metric]);

    return [initialValueMetric, setInitialValueMetric];
}
