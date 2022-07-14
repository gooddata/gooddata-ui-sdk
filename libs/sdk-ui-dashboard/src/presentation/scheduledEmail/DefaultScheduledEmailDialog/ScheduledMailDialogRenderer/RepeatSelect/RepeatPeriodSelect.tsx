// (C) 2019-2022 GoodData Corporation
import * as React from "react";

interface IRepeatPeriodSelectData {
    repeatPeriod: number | string;
}

interface IRepeatPeriodSelectOwnProps {
    onChange: (repeatPeriod: number) => void;
}

export type IRepeatPeriodSelectProps = IRepeatPeriodSelectData & IRepeatPeriodSelectOwnProps;

type IRepeatPeriodSelectState = IRepeatPeriodSelectData;

export class RepeatPeriodSelect extends React.PureComponent<
    IRepeatPeriodSelectProps,
    IRepeatPeriodSelectState
> {
    constructor(props: IRepeatPeriodSelectProps) {
        super(props);
        this.state = {
            repeatPeriod: props.repeatPeriod || 1,
        };
    }

    public render() {
        return (
            <div className="gd-schedule-email-dialog-repeat-period">
                <input
                    className="gd-input-field"
                    onBlur={this.onBlur}
                    onChange={this.onChange}
                    value={this.state.repeatPeriod}
                />
            </div>
        );
    }

    private isInvalidValue = (value: string, repeatPeriod: number): boolean => {
        return value === "" || isNaN(repeatPeriod) || repeatPeriod <= 0;
    };

    private triggerChangeEvent = (repeatPeriod: number) => {
        if (this.state.repeatPeriod !== repeatPeriod) {
            this.setState({ repeatPeriod }, () => this.props.onChange(repeatPeriod));
        }
    };

    private onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const trimmedValue = e.target.value.trim();
        const repeatPeriod: number = parseInt(trimmedValue, 10);

        if (this.isInvalidValue(trimmedValue, repeatPeriod)) {
            this.setState({ repeatPeriod: this.props.repeatPeriod || 1 });
            return;
        }

        this.triggerChangeEvent(repeatPeriod);
    };

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const trimmedValue = e.target.value.trim();
        const repeatPeriod: number = parseInt(trimmedValue, 10);

        if (this.isInvalidValue(trimmedValue, repeatPeriod)) {
            this.setState({ repeatPeriod: "" });
            return;
        }

        this.triggerChangeEvent(repeatPeriod);
    };
}
