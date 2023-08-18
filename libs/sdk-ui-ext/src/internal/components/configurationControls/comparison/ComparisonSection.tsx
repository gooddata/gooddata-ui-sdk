// (C) 2023 GoodData Corporation
import React from "react";

import { PushDataCallback, ISeparators } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../locales.js";
import { COMPARISON_ENABLED_VALUE_PATH } from "./ComparisonValuePath.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../interfaces/ControlProperties.js";
import ConfigSection from "../ConfigSection.js";
import CalculationControl from "./calculation/CalculationControl.js";
import ValueSubSection from "./values/ValueSubSection.js";
import { CalculationType } from "@gooddata/sdk-ui-charts";
import { getComparisonDefaultFormat } from "../../../utils/comparisonHelper.js";

interface IComparisonSectionProps {
    comparisonDisabled: boolean;
    defaultCalculationType: CalculationType;
    separators: ISeparators;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    propertiesMeta: Record<string, { collapsed: boolean }>;
    pushData: PushDataCallback;
}

const ComparisonSection: React.FC<IComparisonSectionProps> = ({
    comparisonDisabled,
    defaultCalculationType,
    separators,
    properties,
    propertiesMeta,
    pushData,
}) => {
    const toggledOn = properties.controls?.comparison?.enabled;
    const sectionDisabled = comparisonDisabled || !toggledOn;

    const defaultFormat = getComparisonDefaultFormat(defaultCalculationType, properties);

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
        </ConfigSection>
    );
};

export default ComparisonSection;
