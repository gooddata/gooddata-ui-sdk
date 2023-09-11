// (C) 2023 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";

import { PushDataCallback } from "@gooddata/sdk-ui";

import { comparisonMessages } from "../../../../../locales.js";
import ConfigSubsection from "../../ConfigSubsection.js";
import { IVisualizationProperties } from "../../../../interfaces/Visualization.js";
import { IComparisonControlProperties } from "../../../../interfaces/ControlProperties.js";
import InputControl from "../../InputControl.js";
import { COMPARISON_LABEL_UNCONDITIONAL_VALUE_PATH } from "../ComparisonValuePath.js";
import { ComparisonPositionValues } from "@gooddata/sdk-ui-charts";

export interface ILabelSubSectionProps {
    sectionDisabled: boolean;
    defaultLabelKey: string;
    properties: IVisualizationProperties<IComparisonControlProperties>;
    pushData: PushDataCallback;
}

const LabelSubSection: React.FC<ILabelSubSectionProps> = ({
    sectionDisabled,
    defaultLabelKey,
    properties,
    pushData,
}) => {
    const { formatMessage } = useIntl();

    const isPositionOnTop = properties?.controls?.comparison?.position === ComparisonPositionValues.TOP;
    const disabled = sectionDisabled || isPositionOnTop;
    const showDisabledMessage = !sectionDisabled && isPositionOnTop;

    const defaultValue =
        properties?.controls?.comparison?.labelConfig?.unconditionalValue ||
        formatMessage({ id: defaultLabelKey });

    return (
        <ConfigSubsection title={comparisonMessages.labelSubSectionTitle.id} canBeToggled={false}>
            <InputControl
                type="text"
                valuePath={COMPARISON_LABEL_UNCONDITIONAL_VALUE_PATH}
                properties={properties}
                labelText={comparisonMessages.labelNameTitle.id}
                disabled={disabled}
                showDisabledMessage={showDisabledMessage}
                disabledMessageId={comparisonMessages.labelPositionOnTopDisabled.id}
                placeholder={defaultLabelKey}
                pushData={pushData}
                value={defaultValue}
            />
        </ConfigSubsection>
    );
};

export default LabelSubSection;
