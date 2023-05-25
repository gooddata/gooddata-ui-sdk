// (C) 2019-2022 GoodData Corporation
import React from "react";

import cx from "classnames";
import noop from "lodash/noop.js";
import { LabelSize } from "./typings.js";

/**
 * @internal
 */

export interface CheckboxProps {
    disabled: boolean;
    name: string;
    text: string;
    title: string;
    value: boolean;
    labelSize: LabelSize;
    onChange: (e: boolean) => void;
}

/**
 * @internal
 */

export class Checkbox extends React.PureComponent<CheckboxProps> {
    static defaultProps = {
        disabled: false,
        name: "",
        text: "",
        title: "",
        value: false,
        labelSize: "small",
        onChange: noop,
    };

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange(e.target.checked);
    };

    render() {
        const { disabled, name, text, title, value, labelSize } = this.props;

        const labelClasses = cx("input-label-text", {
            "gd-label-small gd-checkbox-label-small": labelSize === "small",
            "gd-label gd-checkbox-label": labelSize === "normal",
        });

        return (
            <React.Fragment>
                {title ? <h6>{title}</h6> : null}
                <label className="input-checkbox-label">
                    <input
                        type="checkbox"
                        className="input-checkbox"
                        name={name}
                        checked={value}
                        disabled={disabled}
                        onChange={this.onChange}
                    />
                    <span className={labelClasses}>{text}</span>
                </label>
            </React.Fragment>
        );
    }
}
