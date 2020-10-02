// (C) 2019-2020 GoodData Corporation
import React from "react";

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
        onChange: noop,
    };

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange(e.target.checked);
    };

    render(): React.ReactNode {
        const { disabled, name, text, title, value } = this.props;

        return (
            <React.Fragment>
                <h6>{title}</h6>
                <label className="input-checkbox-label">
                    <input
                        type="checkbox"
                        className="input-checkbox"
                        name={name}
                        checked={value}
                        disabled={disabled}
                        onChange={this.onChange}
                    />
                    <span className="gd-label-small gd-checkbox-label-small input-label-text">{text}</span>
                </label>
            </React.Fragment>
        );
    }
}
