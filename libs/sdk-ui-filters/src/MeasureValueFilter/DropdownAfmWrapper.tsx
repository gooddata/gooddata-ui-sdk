// (C) 2019 GoodData Corporation
import * as React from "react";
import {
    IMeasureValueFilter,
    newMeasureValueFilter,
    measureValueFilterCondition,
    isRangeCondition,
    isRangeConditionOperator,
    measureValueFilterOperator,
} from "@gooddata/sdk-model";

import { IMeasureValueFilterValue, MeasureValueFilterOperator } from "./types";
import { Dropdown } from "./Dropdown";

export interface IDropdownProps {
    filter?: IMeasureValueFilter;
    onApply: (filter: IMeasureValueFilter) => void;
    onCancel: () => void;
    measureIdentifier: string;
    usePercentage?: boolean;
    warningMessage?: string;
    locale?: string;
    anchorEl?: EventTarget | string;
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

/**
 * @beta
 */
export class DropdownAfmWrapper extends React.PureComponent<IDropdownProps> {
    public render() {
        const { filter, onCancel, usePercentage, warningMessage, locale, anchorEl } = this.props;

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
            />
        );
    }

    private onApply = (operator: MeasureValueFilterOperator | null, value: IMeasureValueFilterValue) => {
        const { measureIdentifier, onApply } = this.props;

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
                    ),
                );
            } else {
                onApply(
                    newMeasureValueFilter({ localIdentifier: measureIdentifier }, operator, value.value ?? 0),
                );
            }
        }
    };
}
