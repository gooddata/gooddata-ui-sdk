// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";

// This has to be a class because DayPickerInput refs to it internally.
// See https://github.com/gpbl/react-day-picker/issues/748 for more information
export class DateRangePickerInputFieldBody extends React.Component<
    React.InputHTMLAttributes<HTMLInputElement>
> {
    private inputRef = React.createRef<HTMLInputElement>();

    public invokeInputMethod = (key: "blur" | "focus") => {
        if (this.inputRef.current) {
            this.inputRef.current[key]();
        }
    };

    public blur = () => this.invokeInputMethod("blur");
    public focus = () => this.invokeInputMethod("focus");

    public get value(): string {
        if (this.inputRef.current) {
            return this.inputRef.current.value;
        }

        return "";
    }

    public render(): React.ReactNode {
        const { className } = this.props;
        return (
            <div className={cx("gd-date-range-picker-input-wrapper", className)}>
                <span className="gd-date-range-picker-input-icon icon-calendar" />
                <input
                    {...this.props}
                    ref={this.inputRef}
                    className="gd-date-range-picker-input-field input-text s-date-range-picker-input-field"
                />
            </div>
        );
    }
}
