// (C) 2023-2025 GoodData Corporation

import { type IColorPalette } from "@gooddata/sdk-model";
import { type PushDataCallback } from "@gooddata/sdk-ui";

import { ArrowControl } from "./ArrowControl.js";
import { ColorsControl } from "./colorsControl/ColorsControl.js";
import { comparisonMessages } from "../../../../../locales.js";
import { type IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import { type IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { ConfigSubsection } from "../../ConfigSubsection.js";

interface IIndicatorSubSectionProps {
    sectionDisabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    colorPalette: IColorPalette;
    pushData: PushDataCallback;
}

export function IndicatorSubSection({
    sectionDisabled,
    showDisabledMessage,
    properties,
    colorPalette,
    pushData,
}: IIndicatorSubSectionProps) {
    return (
        <ConfigSubsection title={comparisonMessages["indicatorSubSectionTitle"].id} canBeToggled={false}>
            <div className="comparison-indicator-sub-section s-comparison-indicator-sub-section">
                <ArrowControl
                    disabled={sectionDisabled}
                    showDisabledMessage={showDisabledMessage}
                    properties={properties}
                    pushData={pushData}
                />
                <ColorsControl
                    disabled={sectionDisabled}
                    showDisabledMessage={showDisabledMessage}
                    properties={properties}
                    colorPalette={colorPalette}
                    pushData={pushData}
                />
            </div>
        </ConfigSubsection>
    );
}
