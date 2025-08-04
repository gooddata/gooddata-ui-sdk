// (C) 2019-2025 GoodData Corporation
import React, { memo, useCallback } from "react";
import {
    IMeasureValueFilter,
    newMeasureValueFilter,
    measureValueFilterCondition,
    isRangeCondition,
    isRangeConditionOperator,
    measureValueFilterOperator,
    isComparisonCondition,
} from "@gooddata/sdk-model";

import { IMeasureValueFilterValue, MeasureValueFilterOperator } from "./types.js";
import { Dropdown } from "./Dropdown.js";
import { IMeasureValueFilterCommonProps } from "./typings.js";

/**
 * @beta
 */
export interface IMeasureValueFilterDropdownProps extends IMeasureValueFilterCommonProps {
    onCancel: () => void;
    anchorEl?: HTMLElement | string;
}

const getFilterValue = (filter: IMeasureValueFilter | undefined): IMeasureValueFilterValue => {
    if (!filter) {
        return {};
    }

    const condition = measureValueFilterCondition(filter);
    if (!condition) {
        return {};
    }

    return isRangeCondition(condition)
        ? { from: condition.range.from, to: condition.range.to }
        : { value: condition.comparison.value };
};

const getTreatNullAsZeroValue = (
    filter: IMeasureValueFilter | undefined,
    treatNullAsZeroDefaultValue: boolean,
): boolean => {
    if (!filter || !measureValueFilterCondition(filter)) {
        return treatNullAsZeroDefaultValue !== undefined && treatNullAsZeroDefaultValue;
    }

    const condition = measureValueFilterCondition(filter);

    return (
        (isComparisonCondition(condition) && condition.comparison.treatNullValuesAs !== undefined) ||
        (isRangeCondition(condition) && condition.range.treatNullValuesAs !== undefined) ||
        false
    );
};

/**
 * @beta
 */
export const MeasureValueFilterDropdown = memo(function MeasureValueFilterDropdown({
    filter,
    onCancel,
    onApply,
    measureIdentifier,
    usePercentage,
    warningMessage,
    locale,
    anchorEl,
    separators,
    displayTreatNullAsZeroOption = false,
    treatNullAsZeroDefaultValue = false,
    enableOperatorSelection = true,
}: IMeasureValueFilterDropdownProps) {
    const handleApply = useCallback(
        (
            operator: MeasureValueFilterOperator | null,
            value: IMeasureValueFilterValue,
            treatNullValuesAsZero: boolean,
        ) => {
            if (operator === null || operator === "ALL") {
                onApply(null);
            } else {
                if (isRangeConditionOperator(operator)) {
                    onApply(
                        newMeasureValueFilter(
                            { localIdentifier: measureIdentifier },
                            operator,
                            value.from ?? 0,
                            value.to ?? 0,
                            treatNullValuesAsZero ? 0 : undefined,
                        ),
                    );
                } else {
                    onApply(
                        newMeasureValueFilter(
                            { localIdentifier: measureIdentifier },
                            operator,
                            value.value ?? 0,
                            treatNullValuesAsZero ? 0 : undefined,
                        ),
                    );
                }
            }
        },
        [measureIdentifier, onApply],
    );

    return (
        <Dropdown
            onApply={handleApply}
            onCancel={onCancel}
            operator={(filter && measureValueFilterOperator(filter)) || null}
            value={(filter && getFilterValue(filter)) || null}
            usePercentage={usePercentage}
            warningMessage={warningMessage}
            locale={locale}
            anchorEl={anchorEl}
            separators={separators}
            displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
            treatNullAsZeroValue={getTreatNullAsZeroValue(filter, treatNullAsZeroDefaultValue)}
            enableOperatorSelection={enableOperatorSelection}
        />
    );
});
