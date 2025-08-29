// (C) 2023-2025 GoodData Corporation
import React from "react";

import cloneDeep from "lodash/cloneDeep.js";
import set from "lodash/set.js";
import { WrappedComponentProps, injectIntl } from "react-intl";

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

function DistinctPointShapesControl({
    properties,
    valuePath = "distinctPointShapes.enabled",
    checked = false,
    disabled = false,
    pushData,
    intl,
}: IDistinctPointShapesControlProps & WrappedComponentProps) {
    const onValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                    {getTranslation(messages.canvasDistinctPointShapesLabel.id, intl)}
                </span>
            </label>
            {disabled ? (
                <Bubble
                    className="bubble-primary continuous-line-tooltip"
                    alignPoints={[{ align: "cr cl" }]}
                    arrowOffsets={{ "cr cl": [-75, 0] }}
                >
                    {getTranslation(messages.canvasDistinctPointShapesTooltip.id, intl)}
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
}

export default injectIntl(DistinctPointShapesControl);
