// (C) 2019-2025 GoodData Corporation
import React, { ComponentProps, useState, useEffect, useRef } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import noop from "lodash/noop.js";
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import cx from "classnames";
import DisabledBubbleMessage from "../DisabledBubbleMessage.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";
import { IAlignPoint } from "@gooddata/sdk-ui-kit";

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

export function InputControl({
    valuePath,
    properties,
    labelText,
    value: propValue = "",
    placeholder,
    type = "text",
    disabled = false,
    showDisabledMessage = false,
    disabledMessageId,
    hasWarning = false,
    disabledMessageAlignPoints,
    pushData = noop,
    maxLength,
    description,
    descriptionValues,
    validateFn,
    transformFn,
    intl,
}: IInputControlProps & WrappedComponentProps) {
    const [value, setValue] = useState(propValue);
    const [lastSentValue, setLastSentValue] = useState(propValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const justEmittedRef = useRef(false);

    useEffect(() => {
        setValue(propValue);
        setLastSentValue(propValue);
    }, [propValue]);

    const getInputClassNames = () => {
        return cx("gd-input-field", "gd-input-field-small", {
            "has-warning": hasWarning,
            number: type === "number",
        });
    };

    const isValid = (type: string, value: string) => {
        if (validateFn) {
            return validateFn(value);
        }

        if (type === "number") {
            // allow only numbers, `-` and string doesn't starts with `.`
            return !value.startsWith(".") && (!isNaN(Number(value)) || value === "-");
        }

        return true;
    };

    const onValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        if (isValid(type, value)) {
            setValue(value);
        }
    };

    const triggerBlur = () => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const modifyDataForSending = (value: string) => {
        if (transformFn) {
            return transformFn(value);
        }

        if (type === "number") {
            return value.replace(/\.+$/, "");
        }

        return value;
    };

    const emitData = () => {
        const modifiedData = modifyDataForSending(value);

        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, modifiedData);

        setValue(modifiedData);

        pushData({ properties: clonedProperties });
        justEmittedRef.current = true;

        return modifiedData;
    };

    const onBlur = () => {
        if (justEmittedRef.current) {
            justEmittedRef.current = false;
            return;
        }
        if (lastSentValue !== value) {
            const validatedData = emitData();
            setLastSentValue(validatedData);
        }
    };

    const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            if (lastSentValue !== value) {
                const validatedData = emitData();
                setLastSentValue(validatedData);
                triggerBlur();
            } else {
                triggerBlur();
            }
        }
    };

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
                        ref={inputRef}
                        className={getInputClassNames()}
                        value={value}
                        placeholder={getTranslation(placeholder, intl)}
                        disabled={disabled}
                        onKeyPress={onKeyPress}
                        onBlur={onBlur}
                        onChange={onValueChanged}
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

export default injectIntl(InputControl);
