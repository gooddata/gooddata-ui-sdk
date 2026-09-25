// (C) 2023-2026 GoodData Corporation

import { type ChangeEvent } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";

export interface IContinuousLineControlProps {
    properties?: IVisualizationProperties;
    valuePath?: string;
    checked?: boolean;
    disabled?: boolean;
    pushData?(data: any): void;
}

export function ContinuousLineControl({
    properties,
    valuePath = "continuousLine.enabled",
    checked = false,
    disabled = false,
    pushData,
}: IContinuousLineControlProps) {
    const intl = useIntl();
    const tooltipId = useIdPrefixed("continuous-line-tooltip");

    const onValueChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties!, `controls.${valuePath}`, event.target.checked);

        pushData?.({ properties: clonedProperties });
    };

    const hasTooltip = !disabled;

    return (
        <UiTooltip
            id={tooltipId}
            component="span"
            arrowPlacement="left"
            triggerBy={["hover", "focus"]}
            disabled={!hasTooltip}
            content={getTranslation(messages["canvasContinuousLineTooltip"].id, intl)}
            anchor={
                <label className="input-checkbox-label">
                    <input
                        checked={checked}
                        disabled={disabled}
                        type="checkbox"
                        className="input-checkbox s-continuous-line"
                        onChange={onValueChanged}
                        aria-describedby={hasTooltip ? tooltipId : undefined}
                    />
                    <span className="input-label-text">
                        {getTranslation(messages["canvasContinuousLineLabel"].id, intl)}
                    </span>
                </label>
            }
        />
    );
}
