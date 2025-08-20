// (C) 2019-2025 GoodData Corporation
import React, { ComponentProps } from "react";

import cx from "classnames";
import cloneDeep from "lodash/cloneDeep.js";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";

import { IAlignPoint } from "@gooddata/sdk-ui-kit";

import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";
import DisabledBubbleMessage from "../DisabledBubbleMessage.js";

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
    disabledMessageId?: string;
    hasWarning?: boolean;
    disabledMessageAlignPoints?: IAlignPoint[];
    pushData?(data: any): void;
    validateAndPushDataCallback?(value: string): void;
    maxLength?: number;
    description?: string;
    descriptionValues?: ComponentProps<typeof FormattedMessage>["values"];

    /**
     * Optional function to validate the input value.
     * If the value is considered as invalid, it won't be set and emitted,
     * and last valid value will be used instead.
     *
     * @param value - the value to validate
     * @returns true if the value is valid, false otherwise
     */
    validateFn?: (value: string) => boolean;
    /**
     * Optional function to transform the input value, before it's sent via pushData callback.
     * This callback will be called only for valid values (see validateFn property).
     *
     * @param value - the value to transform
     * @returns the transformed value
     */
    transformFn?: (value: string) => string;
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
        const {
            disabled,
            labelText,
            placeholder,
            showDisabledMessage,
            disabledMessageId,
            disabledMessageAlignPoints,
            intl,
            type,
            maxLength,
            description,
            descriptionValues,
        } = this.props;

        return (
            <DisabledBubbleMessage
                showDisabledMessage={showDisabledMessage}
                messageId={disabledMessageId}
                alignPoints={disabledMessageAlignPoints}
            >
                <>
                    <label className="adi-bucket-inputfield s-adi-bucket-inputfield gd-input gd-input-small">
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
                            maxLength={type === "number" ? MAX_NUMBER_LENGTH : maxLength}
                        />
                    </label>
                    {description ? (
                        <div className="adi-bucket-inputfield-description">
                            <FormattedMessage id={description} values={descriptionValues} />
                        </div>
                    ) : null}
                </>
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
        const { validateFn } = this.props;
        if (validateFn) {
            return validateFn(value);
        }

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
        const { type, transformFn } = this.props;

        if (transformFn) {
            return transformFn(value);
        }

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

            if (lastSentValue === value) {
                this.triggerBlur();
            } else {
                const validatedData = this.emitData();
                this.setState({ lastSentValue: validatedData }, this.triggerBlur);
            }
        }
    }
}

export default injectIntl(InputControl);
