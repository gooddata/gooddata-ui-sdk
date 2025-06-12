// (C) 2023 GoodData Corporation
import React from "react";

import ConfigSubsection from "../../ConfigSubsection.js";
import { ISeparators, PushDataCallback } from "@gooddata/sdk-ui";
import { CalculateAs } from "@gooddata/sdk-ui-charts";

import { comparisonMessages } from "../../../../../locales.js";
import NumberFormatControl from "./numberFormat/NumberFormatControl.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import ComparisonPositionControl from "./ComparisonPositionControl.js";
import { COMPARISON_FORMAT_VALUE_PATH, COMPARISON_SUB_FORMAT_VALUE_PATH } from "../ComparisonValuePath.js";
import { getNumberFormat, getNumberSubFormat } from "../../../../utils/comparisonHelper.js";

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
    const format = getNumberFormat(properties, defaultFormat);
    const subFormat = getNumberSubFormat(properties);
    const shouldDisplaySubFormatControl =
        properties.controls?.comparison?.calculationType === CalculateAs.CHANGE_DIFFERENCE;

    return (
        <ConfigSubsection title={comparisonMessages.valueSubSectionTitle.id} canBeToggled={false}>
            <NumberFormatControl
                disabled={sectionDisabled}
                valuePath={COMPARISON_FORMAT_VALUE_PATH}
                labelText={comparisonMessages.formatTitle.id}
                format={format}
                showDisabledMessage={showDisabledMessage}
                separators={separators}
                properties={properties}
                pushData={pushData}
            />
            {shouldDisplaySubFormatControl ? (
                <NumberFormatControl
                    disabled={sectionDisabled}
                    valuePath={COMPARISON_SUB_FORMAT_VALUE_PATH}
                    labelText={comparisonMessages.subFormatTitle.id}
                    format={subFormat}
                    showDisabledMessage={showDisabledMessage}
                    separators={separators}
                    properties={properties}
                    pushData={pushData}
                />
            ) : null}
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
