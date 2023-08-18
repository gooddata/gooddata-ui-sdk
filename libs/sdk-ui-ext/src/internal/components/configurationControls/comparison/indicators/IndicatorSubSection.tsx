// (C) 2023 GoodData Corporation
import React from "react";

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
    properties: IVisualizationProperties<IComparisonControlProperties>;
    colorPalette: IColorPalette;
    pushData: PushDataCallback;
}

const IndicatorSubSection: React.FC<IIndicatorSubSectionProps> = ({
    sectionDisabled,
    properties,
    colorPalette,
    pushData,
}) => {
    return (
        <ConfigSubsection title={comparisonMessages.indicatorSubSectionTitle.id} canBeToggled={false}>
            <div className="comparison-indicator-sub-section s-comparison-indicator-sub-section">
                <ArrowControl disabled={sectionDisabled} properties={properties} pushData={pushData} />
                <ColorsControl
                    disabled={sectionDisabled}
                    properties={properties}
                    colorPalette={colorPalette}
                    pushData={pushData}
                />
            </div>
        </ConfigSubsection>
    );
};

export default IndicatorSubSection;
