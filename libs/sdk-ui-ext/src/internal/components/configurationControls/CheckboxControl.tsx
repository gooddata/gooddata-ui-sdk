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
}: ICheckboxControlProps) {
    const intl = useIntl();
    const onValueChanged = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const clonedProperties = cloneDeep(properties);
            const value = isValueInverted ? !event.target.checked : event.target.checked;
            set(clonedProperties!, `controls.${valuePath}`, value);
            pushData?.({ properties: clonedProperties });
        },
        [properties, isValueInverted, pushData, valuePath],
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
