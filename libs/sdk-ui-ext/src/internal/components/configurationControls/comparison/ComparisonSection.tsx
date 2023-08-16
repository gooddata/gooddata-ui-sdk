// (C) 2023 GoodData Corporation
import React from "react";

import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../locales.js";
import ConfigSection from "../ConfigSection.js";
import CalculationControl from "./calculation/CalculationControl.js";
import { COMPARISON_ENABLED_VALUE_PATH } from "./ComparisonValuePath.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../interfaces/ControlProperties.js";

interface IComparisonSectionProps {
    comparisonDisabled: boolean;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    propertiesMeta: Record<string, { collapsed: boolean }>;
    pushData: PushDataCallback;
}

const ComparisonSection: React.FC<IComparisonSectionProps> = ({
    comparisonDisabled,
    properties,
    propertiesMeta,
    pushData,
}) => {
    const toggledOn = properties.controls?.comparison?.enabled;

    return (
        <ConfigSection
            id="comparison_section"
            valuePath={COMPARISON_ENABLED_VALUE_PATH}
            title={comparisonMessages.title.id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            pushData={pushData}
            canBeToggled={true}
            toggleDisabled={comparisonDisabled}
            toggledOn={toggledOn}
        >
            <CalculationControl
                disabled={comparisonDisabled || !toggledOn}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSection>
    );
};

export default ComparisonSection;
