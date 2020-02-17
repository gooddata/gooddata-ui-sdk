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
    onApply: (filter: IMeasureValueFilter | null, measureIdentifier: string) => void;
    locale?: string;
    measureTitle?: string;
    measureIdentifier: string;
    displayDropdown?: boolean;
}

const getDropdownData = (
    filter: IMeasureValueFilter | undefined,
): { operator?: MeasureValueFilterOperator; value?: IValue } => {
    if (!filter) {
        return {};
    }

    const condition = measureValueFilterCondition(filter);
    if (!condition) {
        return {};
    }

    const operator = isRangeCondition(condition) ? condition.range.operator : condition.comparison.operator;
    const value = isRangeCondition(condition)
        ? { from: condition.range.from, to: condition.range.to }
        : { value: condition.comparison.value };

    return {
        operator,
        value,
    };
};

/**
 * @beta
 */
export class DropdownAfmWrapper extends React.PureComponent<IDropdownProps> {
    public render() {
        const { button, measureTitle, locale, filter, displayDropdown } = this.props;

        const { operator, value } = getDropdownData(filter);

        return (
            <Dropdown
                displayDropdown={displayDropdown}
                button={button}
                onApply={this.onApply}
                measureTitle={measureTitle}
                locale={locale}
                operator={operator}
                value={value}
            />
        );
    }

    private onApply = (operator: MeasureValueFilterOperator | null, value: IValue) => {
        const { measureIdentifier, onApply } = this.props;

        if (operator === null || operator === "ALL") {
            onApply(null, measureIdentifier);
        } else {
            const filter = isRangeConditionOperator(operator)
                ? newMeasureValueFilter(
                      { localIdentifier: measureIdentifier },
                      operator,
                      value.from!,
                      value.to,
                  )
                : newMeasureValueFilter({ localIdentifier: measureIdentifier }, operator, value.value!);
            onApply(filter, measureIdentifier);
        }
    };
}
