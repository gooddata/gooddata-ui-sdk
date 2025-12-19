// (C) 2019-2025 GoodData Corporation

import { memo, useCallback } from "react";

import {
    type IMeasureValueFilter,
    type ObjRefInScope,
    isComparisonCondition,
    isRangeCondition,
    isRangeConditionOperator,
    measureValueFilterCondition,
    measureValueFilterOperator,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";

import { Dropdown } from "./Dropdown.js";
import { type IMeasureValueFilterValue, type MeasureValueFilterOperator } from "./types.js";
import { type IMeasureValueFilterCommonProps } from "./typings.js";

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
    measureTitle,
    usePercentage,
    warningMessage,
    locale,
    anchorEl,
    separators,
    displayTreatNullAsZeroOption = false,
    treatNullAsZeroDefaultValue = false,
    enableOperatorSelection = true,
    dimensionality,
    insightDimensionality,
    isDimensionalityEnabled,
    catalogDimensionality,
    onDimensionalityChange,
    isLoadingCatalogDimensionality,
}: IMeasureValueFilterDropdownProps) {
    const handleApply = useCallback(
        (
            operator: MeasureValueFilterOperator | null,
            value: IMeasureValueFilterValue,
            treatNullValuesAsZero: boolean,
            newDimensionality?: ObjRefInScope[],
        ) => {
            if (operator === null || operator === "ALL") {
                onApply(null);
                return;
            }

            const commonOptions = {
                treatNullValuesAs: treatNullValuesAsZero ? 0 : undefined,
                ...(isDimensionalityEnabled ? { dimensionality: newDimensionality } : {}),
            };

            const filterOptions = isRangeConditionOperator(operator)
                ? { operator, from: value.from ?? 0, to: value.to ?? 0, ...commonOptions }
                : { operator, value: value.value ?? 0, ...commonOptions };

            onApply(newMeasureValueFilterWithOptions({ localIdentifier: measureIdentifier }, filterOptions));
        },
        [measureIdentifier, onApply, isDimensionalityEnabled],
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
            measureTitle={measureTitle}
            displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
            treatNullAsZeroValue={getTreatNullAsZeroValue(filter, treatNullAsZeroDefaultValue)}
            enableOperatorSelection={enableOperatorSelection}
            dimensionality={dimensionality}
            insightDimensionality={insightDimensionality}
            isDimensionalityEnabled={isDimensionalityEnabled}
            catalogDimensionality={catalogDimensionality}
            onDimensionalityChange={onDimensionalityChange}
            isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
        />
    );
});
