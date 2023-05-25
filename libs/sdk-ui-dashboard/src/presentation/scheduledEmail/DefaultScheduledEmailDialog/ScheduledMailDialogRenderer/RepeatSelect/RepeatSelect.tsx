// (C) 2019-2022 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";

import { REPEAT_EXECUTE_ON, REPEAT_FREQUENCIES, REPEAT_TYPES } from "../../constants.js";

import { RepeatExecuteOnSelect } from "./RepeatExecuteOnSelect.js";
import { RepeatFrequencySelect } from "./RepeatFrequencySelect.js";
import { RepeatPeriodSelect } from "./RepeatPeriodSelect.js";
import { RepeatTypeSelect } from "./RepeatTypeSelect.js";

export interface IRepeatSelectData {
    repeatExecuteOn: string;
    repeatFrequency: string;
    repeatPeriod: number;
    repeatType: string;
}

interface IRepeatSelectOwnProps {
    label: string;
    startDate: Date;
    onChange: (data: IRepeatSelectData) => void;
}

type IRepeatSelectState = IRepeatSelectData;

export type IRepeatSelectProps = IRepeatSelectData & IRepeatSelectOwnProps & WrappedComponentProps;

class RepeatSelectRender extends React.PureComponent<IRepeatSelectProps, IRepeatSelectState> {
    constructor(props: IRepeatSelectProps) {
        super(props);

        const { repeatExecuteOn, repeatFrequency, repeatPeriod, repeatType } = props;
        this.state = {
            repeatExecuteOn,
            repeatFrequency,
            repeatPeriod,
            repeatType,
        };
    }

    public render() {
        const { label, startDate } = this.props;
        const { repeatType } = this.state;
        return (
            <div className="gd-input-component gd-schedule-email-dialog-repeat">
                <label className="gd-label">{label}</label>
                <div>
                    <RepeatTypeSelect
                        repeatType={repeatType}
                        startDate={startDate}
                        onChange={this.onRepeatTypeChange}
                    />
                    {this.renderCustomRepeat()}
                </div>
            </div>
        );
    }

    private onChange = () => this.props.onChange(this.state);

    private onRepeatTypeChange = (repeatType: string) => {
        if (this.state.repeatType !== repeatType) {
            this.setState(
                {
                    repeatExecuteOn: REPEAT_EXECUTE_ON.DAY_OF_MONTH,
                    repeatFrequency: REPEAT_FREQUENCIES.DAY,
                    repeatPeriod: 1,
                    repeatType,
                },
                this.onChange,
            );
        }
    };

    private renderCustomRepeat(): React.ReactNode {
        const { intl } = this.props;
        const { repeatFrequency, repeatPeriod, repeatType } = this.state;
        if (repeatType !== REPEAT_TYPES.CUSTOM) {
            return null;
        }

        return (
            <div className="gd-schedule-email-dialog-repeat-custom">
                <span className="gd-schedule-email-dialog-repeat-every">
                    {intl.formatMessage({
                        id: "dialogs.schedule.email.repeats.every",
                    })}
                </span>
                <RepeatPeriodSelect repeatPeriod={repeatPeriod} onChange={this.onRepeatPeriodChange} />
                <RepeatFrequencySelect
                    repeatFrequency={repeatFrequency}
                    repeatPeriod={repeatPeriod}
                    onChange={this.onRepeatFrequencyChange}
                />
                <div className="break-the-row" />
                {this.renderRepeatExecuteOn()}
            </div>
        );
    }

    private onRepeatPeriodChange = (repeatPeriod: number) => {
        if (this.state.repeatPeriod !== repeatPeriod) {
            this.setState({ repeatPeriod }, this.onChange);
        }
    };

    private onRepeatFrequencyChange = (repeatFrequency: string) => {
        if (this.state.repeatFrequency !== repeatFrequency) {
            this.setState({ repeatFrequency }, this.onChange);
        }
    };

    private renderRepeatExecuteOn = (): React.ReactNode => {
        const { startDate } = this.props;
        const { repeatExecuteOn, repeatFrequency } = this.state;
        if (repeatFrequency !== REPEAT_FREQUENCIES.MONTH) {
            return null;
        }

        return (
            <RepeatExecuteOnSelect
                repeatExecuteOn={repeatExecuteOn}
                startDate={startDate}
                onChange={this.onRepeatExecuteOnChange}
            />
        );
    };

    private onRepeatExecuteOnChange = (repeatExecuteOn: string) => {
        if (this.state.repeatExecuteOn !== repeatExecuteOn) {
            this.setState({ repeatExecuteOn }, this.onChange);
        }
    };
}

export const RepeatSelect = injectIntl(RepeatSelectRender);
