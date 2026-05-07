// (C) 2019-2026 GoodData Corporation

import { memo, useCallback } from "react";

import {
    type IMeasureValueFilter,
    type MeasureValueFilterCondition,
    type ObjRefInScope,
    type OptionsCondition,
    isComparisonCondition,
    isRangeCondition,
    measureValueFilterConditions,
    measureValueFilterOperator,
    newMeasureValueFilterWithOptions,
} from "@gooddata/sdk-model";

import { Dropdown } from "./Dropdown.js";
import { type IMeasureValueFilterCommonProps } from "./typings.js";

/**
 * @beta
 */
export interface IMeasureValueFilterDropdownProps extends IMeasureValueFilterCommonProps {
    onCancel: () => void;
    anchorEl?: HTMLElement | string;
}

const getConditionsFromFilter = (
    filter: IMeasureValueFilter | undefined,
    enableMultipleConditions: boolean,
): MeasureValueFilterCondition[] => {
    if (!filter) {
        return [];
    }
    const conditions = measureValueFilterConditions(filter);
    return conditions?.length ? (enableMultipleConditions ? conditions : conditions.slice(0, 1)) : [];
};

const getTreatNullAsZeroValue = (
    filter: IMeasureValueFilter | undefined,
    treatNullAsZeroDefaultValue: boolean,
    enableMultipleConditions: boolean,
): boolean => {
    const conditions = getConditionsFromFilter(filter, enableMultipleConditions);
    if (conditions.length === 0) {
        return treatNullAsZeroDefaultValue !== undefined && treatNullAsZeroDefaultValue;
    }

    return conditions.some(
        (condition) =>
            (isComparisonCondition(condition) && condition.comparison.treatNullValuesAs !== undefined) ||
            (isRangeCondition(condition) && condition.range.treatNullValuesAs !== undefined),
    );
};

/**
 * @beta
 */
export const MeasureValueFilterDropdown = memo(function MeasureValueFilterDropdown({
    filter,
    onCancel,
    onApply,
    onChange,
    withoutApply,
    BodyComponent,
    DropdownActionsComponent,
    measureIdentifier,
    measureTitle,
    usePercentage,
    warningMessage,
    locale,
    anchorEl,
    separators,
    format,
    useShortFormat,
    displayTreatNullAsZeroOption = false,
    treatNullAsZeroDefaultValue = false,
    enableOperatorSelection = true,
    dimensionality,
    insightDimensionality,
    isDimensionalityEnabled,
    isFilterSummaryEnabled,
    catalogDimensionality,
    loadCatalogDimensionality,
    onDimensionalityChange,
    isLoadingCatalogDimensionality,
    enableMultipleConditions = false,
    enableRankingWithMvf,
    loadMetricDetails,
    isHeaderEnabled,
}: IMeasureValueFilterDropdownProps) {
    const applyOnResult = filter?.measureValueFilter.applyOnResult;

    const buildFilter = useCallback(
        (
            conditions: MeasureValueFilterCondition[] | null,
            newDimensionality?: ObjRefInScope[],
            applyOnResult?: boolean,
        ): IMeasureValueFilter => {
            const effectiveConditions = enableMultipleConditions ? conditions : conditions?.slice(0, 1);

            if (!effectiveConditions?.length) {
                return newMeasureValueFilterWithOptions(
                    { localIdentifier: measureIdentifier },
                    {
                        operator: "ALL",
                        ...(isDimensionalityEnabled ? { dimensionality: newDimensionality } : {}),
                        ...(applyOnResult === undefined ? {} : { applyOnResult }),
                    },
                );
            }

            const treatNullValuesAs = effectiveConditions.some((condition) =>
                isComparisonCondition(condition)
                    ? condition.comparison.treatNullValuesAs !== undefined
                    : condition.range.treatNullValuesAs !== undefined,
            )
                ? 0
                : undefined;
            const commonOptions = {
                treatNullValuesAs,
                ...(isDimensionalityEnabled ? { dimensionality: newDimensionality } : {}),
                ...(applyOnResult === undefined ? {} : { applyOnResult }),
            };

            if (effectiveConditions.length === 1) {
                const condition = effectiveConditions[0];
                if (isRangeCondition(condition)) {
                    return newMeasureValueFilterWithOptions(
                        { localIdentifier: measureIdentifier },
                        {
                            operator: condition.range.operator,
                            from: condition.range.from,
                            to: condition.range.to,
                            ...commonOptions,
                        },
                    );
                }

                return newMeasureValueFilterWithOptions(
                    { localIdentifier: measureIdentifier },
                    {
                        operator: condition.comparison.operator,
                        value: condition.comparison.value,
                        ...commonOptions,
                    },
                );
            }

            const optionsConditions: OptionsCondition[] = effectiveConditions.map((condition) =>
                isComparisonCondition(condition)
                    ? {
                          operator: condition.comparison.operator,
                          value: condition.comparison.value,
                      }
                    : {
                          operator: condition.range.operator,
                          from: condition.range.from,
                          to: condition.range.to,
                      },
            );

            return newMeasureValueFilterWithOptions(
                { localIdentifier: measureIdentifier },
                {
                    conditions: optionsConditions,
                    ...commonOptions,
                },
            );
        },
        [measureIdentifier, isDimensionalityEnabled, enableMultipleConditions],
    );

    const handleApply = useCallback(
        (
            conditions: MeasureValueFilterCondition[] | null,
            newDimensionality?: ObjRefInScope[],
            applyOnResult?: boolean,
        ) => {
            onApply(buildFilter(conditions, newDimensionality, applyOnResult));
        },
        [onApply, buildFilter],
    );

    const handleChange = useCallback(
        (
            conditions: MeasureValueFilterCondition[] | null,
            newDimensionality?: ObjRefInScope[],
            applyOnResult?: boolean,
        ) => {
            onChange?.(buildFilter(conditions, newDimensionality, applyOnResult));
        },
        [onChange, buildFilter],
    );

    return (
        <Dropdown
            onApply={handleApply}
            onChange={onChange ? handleChange : undefined}
            withoutApply={withoutApply}
            BodyComponent={BodyComponent}
            DropdownActionsComponent={DropdownActionsComponent}
            onCancel={onCancel}
            operator={(filter && measureValueFilterOperator(filter)) || null}
            conditions={getConditionsFromFilter(filter, enableMultipleConditions)}
            usePercentage={usePercentage}
            warningMessage={warningMessage}
            locale={locale}
            anchorEl={anchorEl}
            separators={separators}
            format={format}
            useShortFormat={useShortFormat}
            measureTitle={measureTitle}
            displayTreatNullAsZeroOption={displayTreatNullAsZeroOption}
            treatNullAsZeroValue={getTreatNullAsZeroValue(
                filter,
                treatNullAsZeroDefaultValue,
                enableMultipleConditions,
            )}
            enableOperatorSelection={enableOperatorSelection}
            dimensionality={dimensionality}
            insightDimensionality={insightDimensionality}
            isDimensionalityEnabled={isDimensionalityEnabled}
            isFilterSummaryEnabled={isFilterSummaryEnabled}
            catalogDimensionality={catalogDimensionality}
            loadCatalogDimensionality={loadCatalogDimensionality}
            onDimensionalityChange={onDimensionalityChange}
            isLoadingCatalogDimensionality={isLoadingCatalogDimensionality}
            enableMultipleConditions={enableMultipleConditions}
            enableRankingWithMvf={enableRankingWithMvf}
            applyOnResult={applyOnResult}
            loadMetricDetails={loadMetricDetails}
            isHeaderEnabled={isHeaderEnabled}
        />
    );
});
