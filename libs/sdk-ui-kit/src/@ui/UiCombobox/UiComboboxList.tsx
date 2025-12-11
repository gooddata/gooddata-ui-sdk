// (C) 2025 GoodData Corporation

import { Fragment, type HTMLAttributes, type ReactNode } from "react";

import cx from "classnames";

import { e } from "./comboboxBem.js";
import type { IUiComboboxOption } from "./types.js";
import { useComboboxState } from "./UiComboboxContext.js";
import { UiComboboxListItem } from "./UiComboboxListItem.js";

/** @internal */
export interface UiComboboxListProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
    /**
     * The children to render for each option. Renders a `UiComboboxListItem` when not provided.
     */
    children?: (option: IUiComboboxOption, index: number) => ReactNode;
}

/** @internal */
export function UiComboboxList({ children, className, ...htmlProps }: UiComboboxListProps) {
    const { availableOptions } = useComboboxState();

    return (
        <ul {...htmlProps} className={cx(e("list"), className)} role="listbox">
            {/* TODO: Implement virtual list */}
            {availableOptions.map((option, index) =>
                children ? (
                    <Fragment key={option.id}>{children(option, index)}</Fragment>
                ) : (
                    <UiComboboxListItem key={option.id} option={option} index={index} />
                ),
            )}
        </ul>
    );
}
