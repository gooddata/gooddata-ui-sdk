// (C) 2023-2025 GoodData Corporation

import { ChangeEvent } from "react";

import { cloneDeep, set } from "lodash-es";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";

export interface IContinuousLineControlProps {
    properties: IVisualizationProperties;
    valuePath?: string;
    checked?: boolean;
    disabled?: boolean;
    pushData(data: any): void;
}

function ContinuousLineControl({
    properties,
    valuePath = "continuousLine.enabled",
    checked = false,
    disabled = false,
    pushData,
    intl,
}: IContinuousLineControlProps & WrappedComponentProps) {
    const onValueChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${valuePath}`, event.target.checked);

        pushData({ properties: clonedProperties });
    };

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <label className="input-checkbox-label">
                <input
                    aria-label={valuePath}
                    checked={checked}
                    disabled={disabled}
                    type="checkbox"
                    className="input-checkbox s-continuous-line"
                    onChange={onValueChanged}
                />
                <span className="input-label-text">
                    {getTranslation(messages["canvasContinuousLineLabel"].id, intl)}
                </span>
            </label>
            {!disabled && (
                <Bubble
                    className="bubble-primary continuous-line-tooltip"
                    alignPoints={[{ align: "cr cl" }]}
                    arrowOffsets={{ "cr cl": [-75, 0] }}
                >
                    {getTranslation(messages["canvasContinuousLineTooltip"].id, intl)}
                </Bubble>
            )}
        </BubbleHoverTrigger>
    );
}

export default injectIntl(ContinuousLineControl);
