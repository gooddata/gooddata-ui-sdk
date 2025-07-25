// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import cx from "classnames";
import noop from "lodash/noop.js";
import { LabelSize } from "./typings.js";

/**
 * @internal
 */

export interface CheckboxProps {
    id?: string;
    disabled?: boolean;
    name?: string;
    text?: string;
    title?: string;
    value?: boolean;
    labelSize?: LabelSize;
    onChange?: (e: boolean) => void;
}

/**
 * @internal
 */

export const Checkbox = memo(function Checkbox({
    disabled = false,
    name = "",
    text = "",
    title = "",
    value = false,
    labelSize = "small",
    onChange = noop,
    id,
}: CheckboxProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        onChange(e.target.checked);
    };

    const labelClasses = cx("input-label-text", {
        "gd-label-small gd-checkbox-label-small": labelSize === "small",
        "gd-label gd-checkbox-label": labelSize === "normal",
    });

    return (
        <React.Fragment>
            {title ? <h6>{title}</h6> : null}
            <label className="input-checkbox-label">
                <input
                    id={id}
                    type="checkbox"
                    className="input-checkbox"
                    name={name}
                    checked={value}
                    disabled={disabled}
                    onChange={handleChange}
                />
                <span className={labelClasses}>{text}</span>
            </label>
        </React.Fragment>
    );
});
