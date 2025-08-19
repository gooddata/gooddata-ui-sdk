// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { messages } from "../../../../locales.js";
import { rotationDropdownItems } from "../../../constants/dropdowns.js";
import { AxisType } from "../../../interfaces/AxisType.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { getTranslatedDropdownItems } from "../../../utils/translations.js";
import DropdownControl from "../DropdownControl.js";

export interface ILabelRotationControl {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

function LabelRotationControl(props: ILabelRotationControl & WrappedComponentProps) {
    const getControlProperties = (): IVisualizationProperties => {
        const axisProperties = props.properties?.controls?.[props.axis];

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

    const isDisabled = props.disabled || !axisVisible || !axisLabelsEnabled;
    return (
        <DropdownControl
            value={axisRotation}
            valuePath={`${props.axis}.rotation`}
            labelText={messages.axisRotation.id}
            disabled={isDisabled}
            showDisabledMessage={!props.configPanelDisabled && isDisabled}
            properties={props.properties}
            pushData={props.pushData}
            items={getTranslatedDropdownItems(rotationDropdownItems, props.intl)}
        />
    );
}

export default injectIntl(memo(LabelRotationControl));
