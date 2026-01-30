// (C) 2025-2026 GoodData Corporation

import { Fragment, type HTMLAttributes, type ReactNode } from "react";

import cx from "classnames";

import { e } from "./comboboxBem.js";
import type { IUiComboboxOption } from "./types.js";
import { useComboboxState } from "./UiComboboxContext.js";
import { UiComboboxListItem } from "./UiComboboxListItem.js";

/** @internal */
export interface IUiComboboxListProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
    /**
     * The children to render for each option. Renders a `UiComboboxListItem` when not provided.
     */
    children?: (option: IUiComboboxOption, index: number) => ReactNode;
}

/** @internal */
export function UiComboboxList({ children, className, ...htmlProps }: IUiComboboxListProps) {
    const { availableOptions } = useComboboxState();

    return (
        <ul role="listbox" {...htmlProps} className={cx(e("list"), className)}>
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
