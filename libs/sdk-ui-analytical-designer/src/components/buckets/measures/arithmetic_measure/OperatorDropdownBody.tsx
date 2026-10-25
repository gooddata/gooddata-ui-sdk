// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo, useCallback } from "react";

import { FormattedMessage } from "react-intl";

import { LegacySingleSelectList } from "@gooddata/sdk-ui-kit";

import {
    type ArithmeticOperatorType,
    type IOperatorDropdownItem,
} from "../../../../typings/arithmetic_measure.js";

import { OperatorDropdownItem } from "./OperatorDropdownItem.js";

const MAX_LIST_ITEMS = 10;
const LIST_ITEM_HEIGHT = 27;

export interface IOperatorDropdownBodyProps {
    width: number;
    availableOperators: IOperatorDropdownItem[];
    selectedOperator: ArithmeticOperatorType;
    onSelect: (selectedOperator: ArithmeticOperatorType) => void;
}

export const OperatorDropdownBody = memo(function OperatorDropdownBody({
    width,
    availableOperators,
    selectedOperator,
    onSelect,
}: IOperatorDropdownBodyProps): ReactElement {
    const getSelectedItem = useCallback((): IOperatorDropdownItem => {
        return availableOperators.find((item) => item.type === selectedOperator);
    }, [availableOperators, selectedOperator]);

    const handleSelect = useCallback(
        (selectedOperator: IOperatorDropdownItem): void => {
            onSelect(selectedOperator.type);
        },
        [onSelect],
    );

    const operatorsCount = availableOperators.length;
    const listHeight = (operatorsCount > MAX_LIST_ITEMS ? MAX_LIST_ITEMS : operatorsCount) * LIST_ITEM_HEIGHT;

    return (
        <div className="adi-am-operator-selector-list s-adi-am-operator-selector-list">
            <div className="adi-am-operator-selector-list-heading">
                <FormattedMessage id="dashboard.bucket_item.arithmetic_measure.operation_title" />
            </div>
            <LegacySingleSelectList
                items={availableOperators}
                itemsCount={operatorsCount}
                itemHeight={LIST_ITEM_HEIGHT}
                listItemClass={OperatorDropdownItem}
                height={listHeight}
                width={width}
                selection={getSelectedItem()}
                onSelect={handleSelect}
            />
        </div>
    );
});
