// (C) 2023-2025 GoodData Corporation

import { IColorPalette } from "@gooddata/sdk-model";
import { PushDataCallback } from "@gooddata/sdk-ui";
import { ComparisonColorType } from "@gooddata/sdk-ui-charts";

import ColorCheckbox from "./ColorCheckbox.js";
import ColorItem from "./ColorItem.js";
import ColorResetButton from "./ColorResetButton.js";
import { comparisonMessages } from "../../../../../../locales.js";
import { IComparisonControlProperties } from "../../../../../interfaces/ControlProperties.js";
import { IVisualizationProperties } from "../../../../../interfaces/Visualization.js";
import {
    COMPARISON_COLOR_CONFIG_EQUALS,
    COMPARISON_COLOR_CONFIG_NEGATIVE,
    COMPARISON_COLOR_CONFIG_POSITIVE,
} from "../../ComparisonValuePath.js";

interface IColorControlProps {
    disabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    colorPalette: IColorPalette;
    pushData: PushDataCallback;
}

function ColorsControl({
    disabled,
    showDisabledMessage,
    properties,
    colorPalette,
    pushData,
}: IColorControlProps) {
    const colorConfig = properties?.controls?.comparison?.colorConfig;
    const isColorDisabled = disabled || colorConfig?.disabled;

    return (
        <div className="comparison-color-control s-comparison-color-control">
            <ColorCheckbox
                disabled={disabled}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                pushData={pushData}
            />
            <div className="comparison-color-list-item s-comparison-color-list-item">
                <ColorItem
                    disabled={isColorDisabled}
                    showDisabledMessage={showDisabledMessage}
                    color={colorConfig?.positive}
                    colorType={ComparisonColorType.POSITIVE}
                    colorPalette={colorPalette}
                    valuePath={COMPARISON_COLOR_CONFIG_POSITIVE}
                    labelDescriptor={comparisonMessages["colorsConfigPositive"]}
                    properties={properties}
                    pushData={pushData}
                />
                <ColorItem
                    disabled={isColorDisabled}
                    showDisabledMessage={showDisabledMessage}
                    color={colorConfig?.negative}
                    colorType={ComparisonColorType.NEGATIVE}
                    colorPalette={colorPalette}
                    valuePath={COMPARISON_COLOR_CONFIG_NEGATIVE}
                    labelDescriptor={comparisonMessages["colorsConfigNegative"]}
                    properties={properties}
                    pushData={pushData}
                />
                <ColorItem
                    disabled={isColorDisabled}
                    showDisabledMessage={showDisabledMessage}
                    color={colorConfig?.equals}
                    colorType={ComparisonColorType.EQUALS}
                    colorPalette={colorPalette}
                    valuePath={COMPARISON_COLOR_CONFIG_EQUALS}
                    labelDescriptor={comparisonMessages["colorsConfigEquals"]}
                    properties={properties}
                    pushData={pushData}
                />
            </div>
            <ColorResetButton disabled={disabled} properties={properties} pushData={pushData} />
        </div>
    );
}

export default ColorsControl;
