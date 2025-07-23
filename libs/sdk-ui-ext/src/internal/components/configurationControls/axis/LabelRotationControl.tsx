// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";
import { useIntl } from "react-intl";

import DropdownControl from "../DropdownControl.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import { rotationDropdownItems } from "../../../constants/dropdowns.js";
import { AxisType } from "../../../interfaces/AxisType.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

export interface ILabelRotationControl {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

const LabelRotationControl = memo(function LabelRotationControl({
    properties,
    axis,
    disabled,
    configPanelDisabled,
    pushData,
}: ILabelRotationControl) {
    const intl = useIntl();

    const getControlProperties = (): IVisualizationProperties => {
        const axisProperties = properties?.controls?.[axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisLabelsEnabled = axisProperties?.labelsEnabled ?? true;
        const axisRotation = axisProperties?.rotation ?? "auto";

        return {
            axisVisible,
            axisLabelsEnabled,
            axisRotation,
        };
    };

    const { axisVisible, axisLabelsEnabled, axisRotation } = getControlProperties();

    const isDisabled = disabled || !axisVisible || !axisLabelsEnabled;
    return (
        <DropdownControl
            value={axisRotation}
            valuePath={`${axis}.rotation`}
            labelText={messages.axisRotation.id}
            disabled={isDisabled}
            showDisabledMessage={!configPanelDisabled && isDisabled}
            properties={properties}
            pushData={pushData}
            items={getTranslatedDropdownItems(rotationDropdownItems, intl)}
        />
    );
});
export default LabelRotationControl;
