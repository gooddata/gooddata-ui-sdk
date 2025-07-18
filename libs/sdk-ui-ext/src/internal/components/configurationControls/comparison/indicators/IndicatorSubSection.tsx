// (C) 2023-2025 GoodData Corporation

import { PushDataCallback } from "@gooddata/sdk-ui";
import { IColorPalette } from "@gooddata/sdk-model";

import { comparisonMessages } from "../../../../../locales.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import ConfigSubsection from "../../ConfigSubsection.js";
import ArrowControl from "./ArrowControl.js";
import ColorsControl from "./colorsControl/ColorsControl.js";

interface IIndicatorSubSectionProps {
    sectionDisabled: boolean;
    showDisabledMessage?: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    colorPalette: IColorPalette;
    pushData: PushDataCallback;
}

export default function IndicatorSubSection({
    sectionDisabled,
    showDisabledMessage,
    properties,
    colorPalette,
    pushData,
}: IIndicatorSubSectionProps) {
    return (
        <ConfigSubsection title={comparisonMessages.indicatorSubSectionTitle.id} canBeToggled={false}>
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
