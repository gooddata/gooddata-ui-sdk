// (C) 2025-2026 GoodData Corporation

import { type HTMLAttributes, type MouseEvent, memo } from "react";

import cx from "classnames";

import { e } from "./comboboxBem.js";
import type { IUiComboboxOption, IUiComboboxState } from "./types.js";
import { useComboboxState } from "./UiComboboxContext.js";

/** @internal */
export interface IUiComboboxListItemProps extends HTMLAttributes<HTMLLIElement> {
    option: IUiComboboxOption;
    index: number;
}

/** @internal */
export function UiComboboxListItem(props: IUiComboboxListItemProps) {
    const { option } = props;
    const { registerItemRef, setActiveIndex, selectOption, activeOption, selectedOption } =
        useComboboxState();

    const isDisabled = Boolean(option.disabled);
    const isActive = activeOption?.id === option.id;
    const isSelected = selectedOption?.id === option.id;

    return (
        <UiComboboxListItemImpl
            {...props}
            isActive={isActive}
            isSelected={isSelected}
            isDisabled={isDisabled}
            registerItemRef={registerItemRef}
            setActiveIndex={setActiveIndex}
            selectOption={selectOption}
        />
    );
}

type UiComboboxListItemImplProps = IUiComboboxListItemProps & {
    isActive: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    registerItemRef: IUiComboboxState["registerItemRef"];
    setActiveIndex: IUiComboboxState["setActiveIndex"];
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
        onMouseMove,
        isActive,
        isSelected,
        isDisabled,
        registerItemRef,
        setActiveIndex,
        selectOption,
        ...htmlProps
    } = props;

    function handleClick(event: MouseEvent<HTMLLIElement>) {
        if (isDisabled) {
            event.preventDefault();
            return;
        }
        selectOption(option, index);
        onClick?.(event);
    }

    function handleMouseMove(event: MouseEvent<HTMLLIElement>) {
        if (!isActive) {
            setActiveIndex(index);
        }
        onMouseMove?.(event);
    }

    return (
        <li
            {...htmlProps}
            ref={(node) => {
                registerItemRef(node, index);
            }}
            id={option.id}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isDisabled}
            className={cx(e("item", { isActive, isSelected, isDisabled }), className)}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
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

/** @internal */
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

/** @internal */
export function UiComboboxListItemCreatableLabel(props: UiComboboxListItemCreatableLabelProps) {
    const { children = "(create new)", className, ...htmlProps } = props;
    return (
        <span {...htmlProps} className={cx(e("item-creatable"), className)}>
            {children}
        </span>
    );
}
