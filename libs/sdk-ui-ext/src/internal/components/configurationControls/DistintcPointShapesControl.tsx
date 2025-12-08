// (C) 2023-2025 GoodData Corporation

import { ChangeEvent } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";
import { getTranslation } from "../../utils/translations.js";

export interface IDistinctPointShapesControlProps {
    properties: IVisualizationProperties;
    valuePath?: string;
    checked?: boolean;
    disabled?: boolean;
    pushData(data: any): void;
}

export function DistinctPointShapesControl({
    properties,
    valuePath = "distinctPointShapes.enabled",
    checked = false,
    disabled = false,
    pushData,
}: IDistinctPointShapesControlProps) {
    const intl = useIntl();

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
                    className="input-checkbox s-distinct-points-shapes"
                    onChange={onValueChanged}
                />
                <span className="input-label-text">
                    {getTranslation(messages["canvasDistinctPointShapesLabel"].id, intl)}
                </span>
            </label>
            {disabled ? (
                <Bubble
                    className="bubble-primary continuous-line-tooltip"
                    alignPoints={[{ align: "cr cl" }]}
                    arrowOffsets={{ "cr cl": [-75, 0] }}
                >
                    {getTranslation(messages["canvasDistinctPointShapesTooltip"].id, intl)}
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
}
