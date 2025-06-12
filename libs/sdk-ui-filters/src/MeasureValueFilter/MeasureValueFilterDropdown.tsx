// (C) 2019-2022 GoodData Corporation
import React from "react";
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
export class MeasureValueFilterDropdown extends React.PureComponent<IMeasureValueFilterDropdownProps> {
    public static defaultProps: Pick<
        IMeasureValueFilterDropdownProps,
        "displayTreatNullAsZeroOption" | "treatNullAsZeroDefaultValue" | "enableOperatorSelection"
    > = {
        displayTreatNullAsZeroOption: false,
        treatNullAsZeroDefaultValue: false,
        enableOperatorSelection: true,
    };

    public render() {
        const {
            filter,
            onCancel,
            usePercentage,
            warningMessage,
            locale,
            anchorEl,
            separators,
            displayTreatNullAsZeroOption,
            treatNullAsZeroDefaultValue,
            enableOperatorSelection,
        } = this.props;

        return (
            <Dropdown
                onApply={this.onApply}
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
    }

    private onApply = (
        operator: MeasureValueFilterOperator | null,
        value: IMeasureValueFilterValue,
        treatNullValuesAsZero: boolean,
    ) => {
        const { filter, measureIdentifier, onApply } = this.props;
        if (operator === null || operator === "ALL") {
            onApply(null);
        } else {
            if (isRangeConditionOperator(operator)) {
                onApply(
                    newMeasureValueFilter(
                        { localIdentifier: measureIdentifier } || filter.measureValueFilter.measure,
                        operator,
                        value.from ?? 0,
                        value.to ?? 0,
                        treatNullValuesAsZero ? 0 : undefined,
                    ),
                );
            } else {
                onApply(
                    newMeasureValueFilter(
                        { localIdentifier: measureIdentifier } || filter.measureValueFilter.measure,
                        operator,
                        value.value ?? 0,
                        treatNullValuesAsZero ? 0 : undefined,
                    ),
                );
            }
        }
    };
}
