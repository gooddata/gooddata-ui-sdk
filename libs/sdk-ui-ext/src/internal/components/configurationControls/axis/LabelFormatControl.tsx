// (C) 2021-2022 GoodData Corporation

import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import DropdownControl from "../DropdownControl";
import { getTranslatedDropdownItems } from "../../../utils/translations";
import { formatDropdownItems } from "../../../constants/dropdowns";
import { AxisType } from "../../../interfaces/AxisType";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import { messages } from "../../../../locales";

export interface ILabelFormatControl {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

const getControlProperties = (
    properties: IVisualizationProperties,
    axis: AxisType,
): IVisualizationProperties => {
    const axisProperties = properties?.controls?.[axis];

    const axisVisible = axisProperties?.visible ?? true;
    const axisLabelsEnabled = axisProperties?.labelsEnabled ?? true;
    const axisFormat = axisProperties?.format ?? "auto";

    return {
        axisVisible,
        axisLabelsEnabled,
        axisFormat,
    };
};

const LabelFormatControlComponent: React.FC<ILabelFormatControl & WrappedComponentProps> = (props) => {
    const { disabled, properties, axis, configPanelDisabled, pushData, intl } = props;
    const { axisVisible, axisLabelsEnabled, axisFormat } = getControlProperties(properties, axis);
    const isDisabled = disabled || !axisVisible || !axisLabelsEnabled;

    return (
        <DropdownControl
            value={axisFormat}
            valuePath={`${axis}.format`}
            labelText={messages.axisFormat.id}
            disabled={isDisabled}
            showDisabledMessage={!configPanelDisabled && isDisabled}
            properties={properties}
            pushData={pushData}
            items={getTranslatedDropdownItems(formatDropdownItems, intl)}
        />
    );
};

export const LabelFormatControl = injectIntl(LabelFormatControlComponent);
