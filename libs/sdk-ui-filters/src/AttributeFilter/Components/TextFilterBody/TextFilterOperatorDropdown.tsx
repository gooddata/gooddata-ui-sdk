// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessages, useIntl } from "react-intl";

import { Dropdown, DropdownList, type IAlignPoint, SingleSelectListItem } from "@gooddata/sdk-ui-kit";

import { type AttributeFilterTextMode } from "../../filterModeTypes.js";
import { type TextFilterOperator } from "../../textFilterOperatorUtils.js";

/**
 * Props for TextFilterOperatorDropdown component.
 *
 * @alpha
 */
export interface ITextFilterOperatorDropdownProps {
    /**
     * Current operator
     */
    operator: TextFilterOperator;

    /**
     * Callback when operator changes
     */
    onOperatorChange?: (operator: TextFilterOperator) => void;

    /**
     * Whether the dropdown is disabled
     */
    disabled?: boolean;

    /**
     * Available text sub-modes.
     */
    availableTextModes?: AttributeFilterTextMode[];
}

const operatorMessages = defineMessages({
    is: { id: "attributeFilter.operator.is" },
    isNot: { id: "attributeFilter.operator.isNot" },
    contains: { id: "attributeFilter.operator.contains" },
    doesNotContain: { id: "attributeFilter.operator.doesNotContain" },
    startsWith: { id: "attributeFilter.operator.startsWith" },
    doesNotStartWith: { id: "attributeFilter.operator.doesNotStartWith" },
    endsWith: { id: "attributeFilter.operator.endsWith" },
    doesNotEndWith: { id: "attributeFilter.operator.doesNotEndWith" },
});

/**
 * Dropdown for selecting text filter operator.
 * Matches Figma design with 8 operator options.
 *
 * @alpha
 */
export function TextFilterOperatorDropdown(props: ITextFilterOperatorDropdownProps) {
    const { operator, onOperatorChange, disabled, availableTextModes = ["arbitrary", "match"] } = props;
    const intl = useIntl();

    const allOperators: Array<{
        value: TextFilterOperator;
        message: (typeof operatorMessages)[keyof typeof operatorMessages];
    }> = [
        { value: "is", message: operatorMessages.is },
        { value: "isNot", message: operatorMessages.isNot },
        { value: "contains", message: operatorMessages.contains },
        { value: "doesNotContain", message: operatorMessages.doesNotContain },
        { value: "startsWith", message: operatorMessages.startsWith },
        { value: "doesNotStartWith", message: operatorMessages.doesNotStartWith },
        { value: "endsWith", message: operatorMessages.endsWith },
        { value: "doesNotEndWith", message: operatorMessages.doesNotEndWith },
    ];
    const filteredOperators = allOperators.filter((item) => {
        if (item.value === "is" || item.value === "isNot") {
            return availableTextModes.includes("arbitrary");
        }
        return availableTextModes.includes("match");
    });
    const operators = filteredOperators.length > 0 ? filteredOperators : allOperators;

    const handleOperatorSelect = useCallback(
        (selectedOperator: TextFilterOperator) => {
            if (!disabled) {
                onOperatorChange?.(selectedOperator);
            }
        },
        [disabled, onOperatorChange],
    );

    const currentOperator = operators.find((op) => op.value === operator) ?? operators[0];

    const alignPoints: IAlignPoint[] = [{ align: "bl tl" }, { align: "tl bl" }];

    return (
        <div className="gd-text-filter-operator-dropdown s-text-filter-operator-dropdown">
            <Dropdown
                alignPoints={alignPoints}
                closeOnParentScroll
                closeOnOutsideClick
                renderButton={({ toggleDropdown, isOpen }) => (
                    <button
                        type="button"
                        className="gd-text-filter-operator-dropdown__button gd-input-field s-text-filter-operator-select"
                        onClick={toggleDropdown}
                        disabled={disabled}
                    >
                        <span>{intl.formatMessage(currentOperator.message)}</span>
                        <span
                            className={`gd-text-filter-operator-dropdown__icon gd-icon-navigatedown ${
                                isOpen ? "is-open" : ""
                            }`}
                        />
                    </button>
                )}
                renderBody={({ closeDropdown }) => (
                    <DropdownList
                        className="gd-text-filter-operator-dropdown__menu"
                        items={operators}
                        itemHeight={28}
                        renderItem={({ item }) => (
                            <SingleSelectListItem
                                className="gd-text-filter-operator-dropdown__item"
                                title={intl.formatMessage(item.message)}
                                isSelected={item.value === operator}
                                elementType="button"
                                onClick={() => {
                                    handleOperatorSelect(item.value);
                                    closeDropdown();
                                }}
                            />
                        )}
                    />
                )}
            />
        </div>
    );
}
