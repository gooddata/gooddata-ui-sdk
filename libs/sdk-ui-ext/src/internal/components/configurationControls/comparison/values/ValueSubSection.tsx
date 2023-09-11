// (C) 2023 GoodData Corporation
import React from "react";
import { comparisonMessages } from "../../../../../locales.js";
import ConfigSubsection from "../../ConfigSubsection.js";
import { ISeparators, PushDataCallback } from "@gooddata/sdk-ui";
import NumberFormatControl from "./numberFormat/NumberFormatControl.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import ComparisonPositionControl from "./ComparisonPositionControl.js";

interface IValueSubSectionProps {
    sectionDisabled: boolean;
    showDisabledMessage?: boolean;
    defaultFormat: string;
    separators: ISeparators;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const ValueSubSection: React.FC<IValueSubSectionProps> = ({
    sectionDisabled,
    showDisabledMessage,
    defaultFormat,
    separators,
    properties,
    pushData,
}) => {
    return (
        <ConfigSubsection title={comparisonMessages.valueSubSectionTitle.id} canBeToggled={false}>
            <NumberFormatControl
                disabled={sectionDisabled}
                showDisabledMessage={showDisabledMessage}
                defaultFormat={defaultFormat}
                separators={separators}
                properties={properties}
                pushData={pushData}
            />
            <ComparisonPositionControl
                disabled={sectionDisabled}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSubsection>
    );
};

export default ValueSubSection;
