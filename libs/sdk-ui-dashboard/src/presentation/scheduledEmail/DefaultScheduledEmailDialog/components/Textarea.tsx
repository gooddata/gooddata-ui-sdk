// (C) 2019-2025 GoodData Corporation
import * as React from "react";
import cx from "classnames";
interface ITextareaOwnProps {
    className: string;
    hasError: boolean;
    hasWarning: boolean;
    label: string;
    maxlength?: number;
    id?: string;
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
    }

    public render() {
        const { id, className, label, maxlength, placeholder, value, rows } = this.props;
        const classNames = cx(`gd-input-component gd-textarea-component ${className}`);

        return (
            <div className={classNames}>
                <label htmlFor={id} className="gd-label">
                    {label}
                </label>
                <label className="gd-input">
                    <textarea
                        id={id}
                        className={this.getTextareaClassNames()}
                        maxLength={maxlength}
                        placeholder={placeholder}
                        value={value}
                        rows={rows}
                        onChange={this.onChange}
                    />
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

    private onChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.props.onChange(e.target.value);
    };
}
