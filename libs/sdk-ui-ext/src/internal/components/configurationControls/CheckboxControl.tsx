// (C) 2019-2025 GoodData Corporation

import { type ChangeEvent, useCallback } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";
import { DisabledBubbleMessage } from "../DisabledBubbleMessage.js";

export interface ICheckboxControlProps {
    valuePath: string;
    properties?: IVisualizationProperties;
    labelText?: string;
    checked?: boolean;
    disabled?: boolean;
    showDisabledMessage?: boolean;
    disabledMessageId?: string;
    pushData?(data: any): void;
    isValueInverted?: boolean;
}

export function CheckboxControl({
    checked = false,
    disabled = false,
    showDisabledMessage = false,
    labelText,
    valuePath,
    disabledMessageId,
    properties,
    pushData,
    isValueInverted = false,
}: ICheckboxControlProps) {
    const intl = useIntl();
    const onValueChanged = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const clonedProperties = cloneDeep(properties);
            set(
                clonedProperties!,
                `controls.${valuePath}`,
                isValueInverted ? !event.target.checked : event.target.checked,
            );

            pushData?.({ properties: clonedProperties });
        },
        [properties, valuePath, isValueInverted, pushData],
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
                <span className="input-label-text">{getTranslation(labelText, intl)}</span>
            </label>
        </DisabledBubbleMessage>
    );
}
