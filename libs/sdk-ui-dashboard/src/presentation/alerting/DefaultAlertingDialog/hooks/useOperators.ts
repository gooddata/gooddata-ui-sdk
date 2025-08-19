// (C) 2024-2025 GoodData Corporation

import { useMemo } from "react";

import { AlertMetric, AlertMetricComparatorType } from "../../types.js";
import {
    CHANGE_HEADER,
    COMPARISON_OPERATOR_OPTIONS,
    DIFFERENCE_HEADER,
    RELATIVE_CHANGE_OPERATOR_OPTIONS,
    RELATIVE_DIFFERENCE_OPERATOR_OPTIONS,
    SEPARATOR,
} from "../constants.js";

export function useOperators(measure: AlertMetric | undefined) {
    return useMemo(() => {
        if (
            measure?.comparators.find(
                (a) =>
                    a.comparator === AlertMetricComparatorType.PreviousPeriod ||
                    a.comparator === AlertMetricComparatorType.SamePeriodPreviousYear,
            )
        ) {
            return [
                ...COMPARISON_OPERATOR_OPTIONS,
                SEPARATOR,
                CHANGE_HEADER,
                ...RELATIVE_CHANGE_OPERATOR_OPTIONS,
                SEPARATOR,
                DIFFERENCE_HEADER,
                ...RELATIVE_DIFFERENCE_OPERATOR_OPTIONS,
            ];
        }
        return COMPARISON_OPERATOR_OPTIONS;
    }, [measure]);
}
