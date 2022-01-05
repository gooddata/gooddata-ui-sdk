// (C) 2019-2022 GoodData Corporation
import React from "react";

import cx from "classnames";
import noop from "lodash/noop";

/**
 * @internal
 */

export interface CheckboxProps {
    disabled: boolean;
    name: string;
    text: string;
    title: string;
    value: boolean;
    isSmallLabel?: boolean;
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
        isSmallLabel: true,
        onChange: noop,
    };

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange(e.target.checked);
    };

    render(): React.ReactNode {
        const { disabled, name, text, title, value, isSmallLabel } = this.props;

        const labelClasses = cx("input-label-text", {
            "gd-label-small gd-checkbox-label-small": isSmallLabel,
        });

        return (
            <React.Fragment>
                {title && <h6>{title}</h6>}
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
