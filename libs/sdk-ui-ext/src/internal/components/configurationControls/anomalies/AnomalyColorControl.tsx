// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { type IColor, type IColorPalette } from "@gooddata/sdk-model";
import { ComparisonColorType } from "@gooddata/sdk-ui-charts";

import { messages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ColorItem } from "../comparison/indicators/colorsControl/ColorItem.js";

export interface IAnomalyColorControl {
    disabled: boolean;
    value: IColor;
    colorPalette: IColorPalette;
    showDisabledMessage: boolean;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

export const AnomalyColorControl = memo(function AnomalyColorControl(props: IAnomalyColorControl) {
    return (
        <div className="gd-anomalies-color-control">
            <ColorItem
                disabled={props.disabled}
                showDisabledMessage={props.showDisabledMessage}
                color={props.value}
                colorType={ComparisonColorType.EQUALS}
                colorPalette={props.colorPalette}
                valuePath="anomalies.color"
                align="left"
                labelDescriptor={messages["anomalyColor"]}
                properties={props.properties}
                pushData={props.pushData}
            />
        </div>
    );
});
