// (C) 2023 GoodData Corporation
import React from "react";

import { PushDataCallback, ISeparators } from "@gooddata/sdk-ui";
import { CalculationType, getCalculationValuesDefault } from "@gooddata/sdk-ui-charts";
import { IColorPalette } from "@gooddata/sdk-model";

import { comparisonMessages } from "../../../../locales.js";
import { COMPARISON_ENABLED_VALUE_PATH } from "./ComparisonValuePath.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../interfaces/ControlProperties.js";
import ConfigSection from "../ConfigSection.js";
import CalculationControl from "./calculation/CalculationControl.js";
import ValueSubSection from "./values/ValueSubSection.js";
import IndicatorSubSection from "./indicators/IndicatorSubSection.js";
import LabelSubSection from "./label/LabelSubSection.js";

interface IComparisonSectionProps {
    controlDisabled: boolean;
    disabledByVisualization: boolean;
    defaultCalculationType: CalculationType;
    separators: ISeparators;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    propertiesMeta: Record<string, { collapsed: boolean }>;
    colorPalette: IColorPalette;
    pushData: PushDataCallback;
}

const ComparisonSection: React.FC<IComparisonSectionProps> = ({
    controlDisabled,
    disabledByVisualization,
    defaultCalculationType,
    separators,
    properties,
    propertiesMeta,
    colorPalette,
    pushData,
}) => {
    const toggledOn = properties.controls?.comparison?.enabled;

    const comparisonDisabled = controlDisabled || disabledByVisualization;
    const sectionDisabled = comparisonDisabled || !toggledOn;
    const showDisabledMessage = !controlDisabled && disabledByVisualization;
    const calculationType = properties?.controls?.comparison?.calculationType || defaultCalculationType;
    const { defaultFormat, defaultLabelKeys } = getCalculationValuesDefault(calculationType);

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
            showDisabledMessage={showDisabledMessage}
            toggledOn={toggledOn}
        >
            <CalculationControl
                disabled={sectionDisabled}
                showDisabledMessage={showDisabledMessage}
                defaultCalculationType={defaultCalculationType}
                properties={properties}
                pushData={pushData}
            />
            <ValueSubSection
                sectionDisabled={sectionDisabled}
                showDisabledMessage={showDisabledMessage}
                defaultFormat={defaultFormat}
                separators={separators}
                properties={properties}
                pushData={pushData}
            />
            <IndicatorSubSection
                sectionDisabled={sectionDisabled}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                colorPalette={colorPalette}
                pushData={pushData}
            />
            <LabelSubSection
                sectionDisabled={sectionDisabled}
                showDisabledMessage={showDisabledMessage}
                defaultLabelKeys={defaultLabelKeys}
                calculationType={calculationType}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSection>
    );
};

export default ComparisonSection;
