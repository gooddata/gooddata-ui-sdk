// (C) 2019-2025 GoodData Corporation
import { ChangeEvent, ComponentProps, KeyboardEvent, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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

export default function InputControl({
    value: initialValue = "",
    type = "text",
    disabled = false,
    pushData = noop,
    showDisabledMessage = false,
    hasWarning = false,
    labelText,
    placeholder,
    disabledMessageId,
    disabledMessageAlignPoints,
    validateFn,
    valuePath,
    properties,
    transformFn,
    maxLength,
    description,
    descriptionValues,
}: IInputControlProps) {
    const intl = useIntl();

    const [value, setValue] = useState(initialValue);
    const [lastSentValue, setLastSentValue] = useState(initialValue);

    const inputRef = useRef<HTMLInputElement>(null);

    // Sync state with incoming props.value changes
    useEffect(() => {
        if (initialValue !== value) {
            setValue(initialValue);
            setLastSentValue(initialValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValue]);

    function isValid(type: string, val: string) {
        if (validateFn) {
            return validateFn(val);
        }
        if (type === "number") {
            // allow only numbers, `-` and string doesn't start with `.`
            return !val.startsWith(".") && (!isNaN(Number(val)) || val === "-");
        }
        return true;
    }

    function onValueChanged(event: ChangeEvent<HTMLInputElement>) {
        const val = event.target.value;
        if (isValid(type, val)) {
            setValue(val);
        }
    }

    function triggerBlur() {
        inputRef.current?.blur();
    }

    function modifyDataForSending(val: string) {
        if (transformFn) {
            return transformFn(val);
        }
        if (type === "number") {
            return val.replace(/\.+$/, "");
        }
        return val;
    }

    function emitData() {
        if (!valuePath || !properties) {
            return value;
        }

        const modifiedData = modifyDataForSending(value);
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, modifiedData);

        setValue(modifiedData);

        pushData({ properties: clonedProperties });

        return modifiedData;
    }

    function onBlur() {
        if (lastSentValue !== value) {
            const validatedData = emitData();
            setLastSentValue(validatedData);
        }
    }

    function onKeyPress(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            if (lastSentValue !== value) {
                const validatedData = emitData();
                setLastSentValue(validatedData);
                triggerBlur();
            } else {
                triggerBlur();
            }
        }
    }

    function getInputClassNames() {
        return cx("gd-input-field", "gd-input-field-small", {
            "has-warning": hasWarning,
            number: type === "number",
        });
    }

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
