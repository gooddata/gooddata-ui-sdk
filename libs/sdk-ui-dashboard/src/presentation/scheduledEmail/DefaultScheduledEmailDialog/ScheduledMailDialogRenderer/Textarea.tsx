// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import cx from "classnames";

import { isMobileView } from "../utils/responsive.js";
interface ITextareaOwnProps {
    className: string;
    hasError: boolean;
    hasWarning: boolean;
    label: string;
    maxlength?: number;
    placeholder: string;
    value: string;
    rows: number;
    onChange: (value: string) => void;
}

interface ITextareaState {
    rows: number;
}

export type ITextareaProps = ITextareaOwnProps;

export class Textarea extends React.PureComponent<ITextareaProps, ITextareaState> {
    public static defaultProps = {
        className: "",
        hasError: false,
        hasWarning: false,
    };

    constructor(props: ITextareaProps) {
        super(props);
        this.state = {
            rows: isMobileView() ? 1 : props.rows,
        };
    }

    public render() {
        const { className, label, maxlength, placeholder, value } = this.props;
        const { rows } = this.state;

        const classNames = cx(`gd-input-component gd-textarea-component ${className}`, {
            "gd-textarea-component-collapsed": rows === 1,
        });

        return (
            <div className={classNames}>
                <label className="gd-label">{label}</label>
                <label className="gd-input">
                    <textarea
                        className={this.getTextareaClassNames()}
                        maxLength={maxlength}
                        placeholder={placeholder}
                        value={value}
                        rows={rows}
                        onBlur={this.onBlur}
                        onChange={this.onChange}
                        onFocus={this.onFocus}
                    />
                    {rows === 1 ? this.renderCollapseIndicator() : null}
                </label>
            </div>
        );
    }

    private getTextareaClassNames = (): string => {
        const { hasError, hasWarning } = this.props;
        return cx("gd-input-field", {
            "has-error": hasError,
            "has-warning": hasWarning,
        });
    };

    private onBlur = (_e: React.FocusEvent<HTMLTextAreaElement>): void => {
        if (isMobileView()) {
            this.setState({ rows: 1 });
        }
    };

    private onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.props.onChange(e.target.value);
    };

    private onFocus = (_e: React.FocusEvent<HTMLTextAreaElement>): void => {
        if (isMobileView()) {
            this.setState({ rows: this.props.rows });
        }
    };

    private renderCollapseIndicator = (): React.ReactNode => {
        return <span className="gd-input-component-indicator">&#8943;</span>;
    };
}
