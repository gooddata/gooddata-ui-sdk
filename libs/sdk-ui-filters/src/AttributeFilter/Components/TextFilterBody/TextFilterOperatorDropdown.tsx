// (C) 2007-2026 GoodData Corporation

import { useCallback, useRef } from "react";

import { defineMessages, useIntl } from "react-intl";

import {
    Dropdown,
    DropdownButton,
    type IAlignPoint,
    SingleSelectListItem,
    UiListbox,
    type UiListboxAriaAttributes,
} from "@gooddata/sdk-ui-kit";

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

    /**
     * Optional id of the operator trigger button.
     */
    controlId?: string;
}

const operatorMessages = defineMessages({
    all: { id: "attributeFilter.operator.all" },
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
    const {
        operator,
        onOperatorChange,
        disabled,
        availableTextModes = ["arbitrary", "match"],
        controlId,
    } = props;
    const intl = useIntl();
    const triggerRef = useRef<HTMLDivElement | null>(null);

    type OperatorItem = {
        value: TextFilterOperator;
        message: (typeof operatorMessages)[keyof typeof operatorMessages];
    };
    type MenuItem = OperatorItem | { type: "divider" };

    const allOperators: OperatorItem[] = [
        { value: "all", message: operatorMessages.all },
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
        if (item.value === "all") {
            return true;
        }
        if (item.value === "is" || item.value === "isNot") {
            return availableTextModes.includes("arbitrary");
        }
        return availableTextModes.includes("match");
    });
    const operators = filteredOperators.length > 0 ? filteredOperators : allOperators;

    const menuItems: MenuItem[] = [];
    operators.forEach((op, index) => {
        menuItems.push(op);
        if (
            op.value === "all" ||
            op.value === "isNot" ||
            op.value === "doesNotContain" ||
            op.value === "doesNotStartWith" ||
            op.value === "doesNotEndWith"
        ) {
            if (index < operators.length - 1) {
                menuItems.push({ type: "divider" });
            }
        }
    });

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
    const listboxItems = menuItems.map((item) => {
        if ("type" in item && item.type === "divider") {
            return {
                type: "static" as const,
                data: { type: "separator" as const },
            };
        }

        const operatorItem = item as OperatorItem;
        return {
            type: "interactive" as const,
            id: operatorItem.value,
            stringTitle: intl.formatMessage(operatorItem.message),
            data: operatorItem,
        };
    });

    const buttonValue = intl.formatMessage(currentOperator.message);

    return (
        <div className="gd-text-filter-operator-dropdown s-text-filter-operator-dropdown">
            <Dropdown
                alignPoints={alignPoints}
                closeOnParentScroll
                closeOnOutsideClick
                autofocusOnOpen
                renderButton={({ toggleDropdown, isOpen, buttonRef, dropdownId }) => (
                    <div
                        ref={(el) => {
                            triggerRef.current = el;
                        }}
                        data-testid="text-filter-operator-trigger"
                    >
                        <DropdownButton
                            id={controlId}
                            value={buttonValue}
                            disabled={disabled}
                            className="gd-text-filter-operator-dropdown__button gd-input-field s-text-filter-operator-select"
                            onClick={toggleDropdown}
                            buttonRef={buttonRef as React.MutableRefObject<HTMLElement>}
                            dropdownId={dropdownId}
                            isOpen={isOpen}
                            accessibilityConfig={{
                                ariaExpanded: isOpen,
                                popupType: "listbox",
                            }}
                        />
                    </div>
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <div
                        className="gd-text-filter-operator-dropdown__menu"
                        data-testid="text-filter-operator-menu"
                    >
                        <UiListbox<OperatorItem, { type: "separator" }>
                            shouldKeyboardActionPreventDefault
                            shouldKeyboardActionStopPropagation
                            width={triggerRef.current?.offsetWidth}
                            items={listboxItems}
                            selectedItemId={operator}
                            maxHeight={400}
                            onSelect={(item) => {
                                handleOperatorSelect(item.data.value);
                            }}
                            onClose={closeDropdown}
                            ariaAttributes={ariaAttributes as UiListboxAriaAttributes}
                            InteractiveItemComponent={({ item, isSelected, onSelect, isFocused }) => {
                                return (
                                    <SingleSelectListItem
                                        className="gd-text-filter-operator-dropdown__item"
                                        dataTestId={`text-filter-operator-${item.data.value}`}
                                        title={item.stringTitle}
                                        isSelected={isSelected}
                                        isFocused={isFocused}
                                        onClick={onSelect}
                                    />
                                );
                            }}
                            StaticItemComponent={() => {
                                return (
                                    <SingleSelectListItem
                                        type="separator"
                                        accessibilityConfig={{
                                            role: "separator",
                                        }}
                                        className="gd-text-filter-operator-dropdown__divider"
                                    />
                                );
                            }}
                        />
                    </div>
                )}
            />
        </div>
    );
}
