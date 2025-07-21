// (C) 2025 GoodData Corporation

import { ChangeEvent } from "react";
import { bem } from "../@utils/bem.js";

/**
 * @internal
 */
export interface UiCheckboxProps {
    checked: boolean;
    onChange?: (e: ChangeEvent) => void;
    preventDefault?: boolean;
    indeterminate?: boolean;
}

const { b, e } = bem("gd-ui-kit-checkbox");

/**
 * @internal
 */
export function UiCheckbox({
    checked,
    onChange = () => {},
    preventDefault = false,
    indeterminate = false,
}: UiCheckboxProps) {
    return (
        <label className={b()}>
            <input
                type="checkbox"
                className={e("input")}
                checked={checked}
                onChange={onChange}
                onClick={(e) => preventDefault && e.stopPropagation()}
            />
            <span className={e("box", { checked, indeterminate })} />
        </label>
    );
}
