// (C) 2023 GoodData Corporation
import React from "react";

import { PushDataCallback, ISeparators } from "@gooddata/sdk-ui";
import { CalculationType } from "@gooddata/sdk-ui-charts";
import { IColorPalette } from "@gooddata/sdk-model";

import { comparisonMessages } from "../../../../locales.js";
import { COMPARISON_ENABLED_VALUE_PATH } from "./ComparisonValuePath.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../interfaces/ControlProperties.js";
import ConfigSection from "../ConfigSection.js";
import CalculationControl from "./calculation/CalculationControl.js";
import ValueSubSection from "./values/ValueSubSection.js";
import { getComparisonDefaultValues } from "../../../utils/comparisonHelper.js";
import IndicatorSubSection from "./indicators/IndicatorSubSection.js";
import LabelSubSection from "./label/LabelSubSection.js";

interface IComparisonSectionProps {
    comparisonDisabled: boolean;
    defaultCalculationType: CalculationType;
    separators: ISeparators;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    propertiesMeta: Record<string, { collapsed: boolean }>;
    colorPalette: IColorPalette;
    pushData: PushDataCallback;
}

const ComparisonSection: React.FC<IComparisonSectionProps> = ({
    comparisonDisabled,
    defaultCalculationType,
    separators,
    properties,
    propertiesMeta,
    colorPalette,
    pushData,
}) => {
    const toggledOn = properties.controls?.comparison?.enabled;
    const sectionDisabled = comparisonDisabled || !toggledOn;

    const { defaultFormat, defaultLabelKey } = getComparisonDefaultValues(defaultCalculationType, properties);

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
                disabled={sectionDisabled}
                defaultCalculationType={defaultCalculationType}
                properties={properties}
                pushData={pushData}
            />
            <ValueSubSection
                sectionDisabled={sectionDisabled}
                defaultFormat={defaultFormat}
                separators={separators}
                properties={properties}
                pushData={pushData}
            />
            <IndicatorSubSection
                sectionDisabled={sectionDisabled}
                properties={properties}
                colorPalette={colorPalette}
                pushData={pushData}
            />
            <LabelSubSection
                sectionDisabled={sectionDisabled}
                defaultLabelKey={defaultLabelKey}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSection>
    );
};

export default ComparisonSection;
