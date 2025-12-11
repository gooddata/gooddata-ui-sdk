// (C) 2025 GoodData Corporation

import { type HTMLAttributes, type MouseEvent, memo } from "react";

import cx from "classnames";

import { e } from "./comboboxBem.js";
import type { IUiComboboxOption, IUiComboboxState } from "./types.js";
import { useComboboxState } from "./UiComboboxContext.js";

/** @internal */
export interface UiComboboxListItemProps extends HTMLAttributes<HTMLLIElement> {
    option: IUiComboboxOption;
    index: number;
}

/** @internal */
export function UiComboboxListItem(props: UiComboboxListItemProps) {
    const { option } = props;
    const { registerItemRef, getItemProps, selectOption, activeOption, selectedOption } = useComboboxState();

    const isDisabled = Boolean(option.disabled);
    const isActive = activeOption?.id === option.id;
    const isSelected = selectedOption?.id === option.id;

    return (
        <UiComboboxListItemImpl
            {...props}
            isActive={isActive}
            isSelected={isSelected}
            isDisabled={isDisabled}
            getItemProps={getItemProps}
            registerItemRef={registerItemRef}
            selectOption={selectOption}
        />
    );
}

type UiComboboxListItemImplProps = UiComboboxListItemProps & {
    isActive: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    getItemProps: IUiComboboxState["getItemProps"];
    registerItemRef: IUiComboboxState["registerItemRef"];
    selectOption: IUiComboboxState["selectOption"];
};

export const UiComboboxListItemImpl = memo(function UiComboboxListItemImpl(
    props: UiComboboxListItemImplProps,
) {
    const {
        option,
        index,
        className,
        children,
        onClick,
        isActive,
        isSelected,
        isDisabled,
        getItemProps,
        registerItemRef,
        selectOption,
        ...htmlProps
    } = props;

    // https://floating-ui.com/docs/useRole#component-roles
    const itemProps = getItemProps({
        ...htmlProps,
        active: isActive,
        selected: isSelected,
    });

    function handleClick(event: MouseEvent<HTMLLIElement>) {
        if (isDisabled) {
            event.preventDefault();
            return;
        }
        selectOption(option, index);
        onClick?.(event);
    }

    return (
        <li
            {...itemProps}
            ref={(node) => {
                registerItemRef(node, index);
            }}
            id={option.id}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
            className={cx(e("item", { isActive, isSelected, isDisabled }), className)}
            onClick={handleClick}
        >
            {children ?? (
                <>
                    <UiComboboxListItemLabel>{option.label}</UiComboboxListItemLabel>
                    {option.creatable ? <UiComboboxListItemCreatableLabel /> : null}
                </>
            )}
        </li>
    );
});

/** @internal */
export type UiComboboxListItemLabelProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Renders the primary label content within a combobox list item.
 * Use this component for composable customization of list item content.
 *
 * @internal
 */
export function UiComboboxListItemLabel(props: UiComboboxListItemLabelProps) {
    const { children, className, ...htmlProps } = props;
    return (
        <span {...htmlProps} className={cx(e("item-label"), className)}>
            {children}
        </span>
    );
}

/** @internal */
export type UiComboboxListItemCreatableLabelProps = HTMLAttributes<HTMLSpanElement>;

/**
 * Renders the "creatable" label suffix within a combobox list item.
 * Use this component for composable customization of list item content.
 *
 * @internal
 */
export function UiComboboxListItemCreatableLabel(props: UiComboboxListItemCreatableLabelProps) {
    const { children = "(create new)", className, ...htmlProps } = props;
    return (
        <span {...htmlProps} className={cx(e("item-creatable"), className)}>
            {children}
        </span>
    );
}
