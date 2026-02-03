// (C) 2019-2026 GoodData Corporation

import { type ChangeEvent, type ReactNode, useCallback } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";
import { DisabledBubbleMessage } from "../DisabledBubbleMessage.js";

export interface ICheckboxControlProps {
    valuePath: string;
    properties?: IVisualizationProperties;
    labelText?: string;
    labelContent?: ReactNode;
    checked?: boolean;
    disabled?: boolean;
    showDisabledMessage?: boolean;
    disabledMessageId?: string;
    pushData?(data: any): void;
    isValueInverted?: boolean;
    /**
     * The default value for this control. When the value matches the default,
     * the property is removed from properties instead of being set.
     * This prevents the Save button from staying enabled when the user
     * toggles back to the default state.
     */
    defaultValue?: boolean;
}

export function CheckboxControl({
    checked = false,
    disabled = false,
    showDisabledMessage = false,
    labelText,
    labelContent,
    valuePath,
    disabledMessageId,
    properties,
    pushData,
    isValueInverted = false,
    defaultValue,
}: ICheckboxControlProps) {
    const intl = useIntl();
    const onValueChanged = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const clonedProperties = cloneDeep(properties);
            const value = isValueInverted ? !event.target.checked : event.target.checked;
            // When the value matches the default, set to undefined so the property gets removed
            // during merge. This prevents the Save button from staying enabled when toggling
            // back to the default state.
            const valueToSet = value === defaultValue ? undefined : value;
            set(clonedProperties!, `controls.${valuePath}`, valueToSet);
            pushData?.({ properties: clonedProperties });
        },
        [properties, isValueInverted, pushData, valuePath, defaultValue],
    );

    return (
        <DisabledBubbleMessage showDisabledMessage={showDisabledMessage} messageId={disabledMessageId}>
            <label className="input-checkbox-label">
                <input
                    aria-label={valuePath}
                    checked={checked}
                    disabled={disabled}
                    type="checkbox"
                    className="input-checkbox"
                    onChange={onValueChanged}
                />
                {labelText ? (
                    <span className="input-label-text">{getTranslation(labelText, intl)}</span>
                ) : null}
                {labelContent ? <span className="input-label-text">{labelContent}</span> : null}
            </label>
        </DisabledBubbleMessage>
    );
}
