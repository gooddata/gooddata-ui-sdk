// (C) 2019 GoodData Corporation
import * as React from "react";
import {
    IMeasureValueFilter,
    newMeasureValueFilter,
    measureValueFilterCondition,
    isRangeCondition,
    isRangeConditionOperator,
} from "@gooddata/sdk-model";

import { IValue, MeasureValueFilterOperator } from "./types";
import { Dropdown } from "./Dropdown";

export interface IDropdownProps {
    filter?: IMeasureValueFilter;
    button?: React.ComponentType<any>;
    onApply: (filter: IMeasureValueFilter, measureIdentifier: string) => void;
    locale?: string;
    measureTitle?: string;
    measureIdentifier: string;
    displayDropdown?: boolean;
}

const getDropdownData = (
    filter: IMeasureValueFilter,
): { operator: MeasureValueFilterOperator; value: IValue } => {
    if (!filter) {
        return {
            operator: null,
            value: null,
        };
    }

    const condition = measureValueFilterCondition(filter);
    const operator = isRangeCondition(condition) ? condition.range.operator : condition.comparison.operator;
    const value = isRangeCondition(condition)
        ? { from: condition.range.from, to: condition.range.to }
        : { value: condition.comparison.value };

    return {
        operator,
        value,
    };
};

export class DropdownAfmWrapper extends React.PureComponent<IDropdownProps> {
    public render() {
        const { button, measureTitle, locale, filter, displayDropdown } = this.props;

        const dropdownData = getDropdownData(filter);

        return (
            <Dropdown
                displayDropdown={displayDropdown}
                button={button}
                onApply={this.onApply}
                measureTitle={measureTitle}
                locale={locale}
                operator={dropdownData.operator}
                value={dropdownData.value}
            />
        );
    }

    private onApply = (operator: MeasureValueFilterOperator, value: IValue) => {
        const { measureIdentifier, onApply } = this.props;

        if (operator === null || operator === "ALL") {
            onApply(null, measureIdentifier);
        } else {
            const filter = isRangeConditionOperator(operator)
                ? newMeasureValueFilter({ identifier: measureIdentifier }, operator, value.from, value.to)
                : newMeasureValueFilter({ identifier: measureIdentifier }, operator, value.value);
            onApply(filter, measureIdentifier);
        }
    };
}
