// (C) 2007-2025 GoodData Corporation

import { Component, type InputHTMLAttributes, createRef } from "react";

import cx from "classnames";

// This has to be a class because DayPickerInput refs to it internally.
// See https://github.com/gpbl/react-day-picker/issues/748 for more information
export class DateRangePickerInputFieldBody extends Component<InputHTMLAttributes<HTMLInputElement>> {
    private inputRef = createRef<HTMLInputElement>();

    public invokeInputMethod = (key: "blur" | "focus"): void => {
        if (this.inputRef.current) {
            this.inputRef.current[key]();
        }
    };

    public blur = (): void => this.invokeInputMethod("blur");
    public focus = (): void => this.invokeInputMethod("focus");

    public get value(): string {
        if (this.inputRef.current) {
            return this.inputRef.current.value;
        }

        return "";
    }

    public override render() {
        const { className } = this.props;
        return (
            <span className={cx(className)}>
                <span className="gd-icon-calendar" aria-hidden="true" />
                <input
                    {...this.props}
                    ref={this.inputRef}
                    className="input-text s-date-range-picker-input-field"
                />
            </span>
        );
    }
}
