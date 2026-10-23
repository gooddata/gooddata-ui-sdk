// (C) 2021-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { FormField } from "../data.js";
import { useOtherMetrics } from "../OtherMetrics/useOtherMetrics.js";

import { useMetricFormField } from "./useMetricFormField.js";

export function useTitleExistsCheck(): boolean {
    const { otherMetrics } = useOtherMetrics();
    const { value, dirty } = useMetricFormField(FormField.title);

    const [titleExists, setTitleExists] = useState(false);

    useEffect(() => {
        if (value && dirty) {
            setTitleExists(otherMetrics.some((m) => m.title === value));
        } else {
            setTitleExists(false);
        }
    }, [dirty, otherMetrics, value]);

    return titleExists;
}
