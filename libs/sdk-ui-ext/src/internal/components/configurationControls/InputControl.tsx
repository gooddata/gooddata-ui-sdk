// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import cx from "classnames";
import DisabledBubbleMessage from "../DisabledBubbleMessage.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";

export interface IInputControlProps {
    valuePath: string;
    properties: IVisualizationProperties;
    labelText?: string;
    value?: string;
    placeholder?: string;
    type?: string;
    max?: number;
    min?: number;
    step?: number;
    disabled?: boolean;
    showDisabledMessage?: boolean;
    hasWarning?: boolean;
    pushData?(data: any): void;
    validateAndPushDataCallback?(value: string): void;
}

export interface IInputControlState {
    value?: string;
    lastSentValue?: string;
}

const MAX_NUMBER_LENGTH = 15;

export class InputControl extends React.Component<
    IInputControlProps & WrappedComponentProps,
    IInputControlState
> {
    public static defaultProps = {
        value: "",
        type: "text",
        disabled: false,
        pushData: noop,
        max: Number.MAX_SAFE_INTEGER,
        min: Number.MIN_SAFE_INTEGER,
        step: 1,
        showDisabledMessage: false,
        hasWarning: false,
        validateAndPushDataCallback: noop,
    };

    private inputRef: HTMLElement;

    constructor(props: IInputControlProps & WrappedComponentProps) {
        super(props);

        this.state = {
            value: props.value,
            lastSentValue: props.value,
        };

        this.onValueChanged = this.onValueChanged.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.triggerBlur = this.triggerBlur.bind(this);
    }

    public UNSAFE_componentWillReceiveProps(newProps: IInputControlProps & WrappedComponentProps): void {
        if (newProps.value !== this.state.value) {
            this.setState({
                value: newProps.value,
                lastSentValue: newProps.value,
            });
        }
    }

    public render() {
        const { disabled, labelText, placeholder, showDisabledMessage, intl, type } = this.props;

        return (
            <DisabledBubbleMessage showDisabledMessage={showDisabledMessage}>
                <label className="adi-bucket-inputfield gd-input gd-input-small">
                    <span className="input-label-text">{getTranslation(labelText, intl)}</span>
                    <input
                        ref={(input) => (this.inputRef = input)}
                        className={this.getInputClassNames()}
                        value={this.state.value}
                        placeholder={getTranslation(placeholder, intl)}
                        disabled={disabled}
                        onKeyPress={this.onKeyPress}
                        onBlur={this.onBlur}
                        onChange={this.onValueChanged}
                        maxLength={type === "number" ? MAX_NUMBER_LENGTH : null}
                    />
                </label>
            </DisabledBubbleMessage>
        );
    }

    private getInputClassNames() {
        const { type, hasWarning } = this.props;

        return cx("gd-input-field", "gd-input-field-small", {
            "has-warning": hasWarning,
            number: type === "number",
        });
    }

    private isValid(type: string, value: string) {
        if (type === "number") {
            // allow only numbers, `-` and string doesn't starts with `.`
            return !value.startsWith(".") && (!isNaN(Number(value)) || value === "-");
        }

        return true;
    }

    private onValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const { type } = this.props;
        const { value } = event.target;

        if (this.isValid(type, value)) {
            this.setState({ value });
        }
    }

    private triggerBlur() {
        if (this.inputRef) {
            this.inputRef.blur();
        }
    }

    private modifyDataForSending(value: string) {
        const { type } = this.props;

        if (type === "number") {
            return value.replace(/\.+$/, "");
        }

        return value;
    }

    private emitData() {
        const { valuePath, properties, pushData } = this.props;
        const { value } = this.state;

        const modifiedData = this.modifyDataForSending(value);

        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, modifiedData);

        this.setState({ value: modifiedData });

        pushData({ properties: clonedProperties });

        return modifiedData;
    }

    private onBlur() {
        const { value, lastSentValue } = this.state;

        if (lastSentValue !== value) {
            const validatedData = this.emitData();
            this.setState({ lastSentValue: validatedData });
        }
    }

    private onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            const { value, lastSentValue } = this.state;

            if (lastSentValue !== value) {
                const validatedData = this.emitData();
                this.setState({ lastSentValue: validatedData }, this.triggerBlur);
            } else {
                this.triggerBlur();
            }
        }
    }
}

export default injectIntl(InputControl);
