// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import DropdownControl from "../DropdownControl";
import { getTranslatedDropdownItems } from "../../../utils/translations";
import { rotationDropdownItems } from "../../../constants/dropdowns";
import { AxisType } from "../../../interfaces/AxisType";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import { messages } from "../../../../locales";

export interface ILabelRotationControl {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

class LabelRotationControl extends React.PureComponent<ILabelRotationControl & WrappedComponentProps> {
    public render(): React.ReactNode {
        const { axisVisible, axisLabelsEnabled, axisRotation } = this.getControlProperties();

        const isDisabled = this.props.disabled || !axisVisible || !axisLabelsEnabled;
        return (
            <DropdownControl
                value={axisRotation}
                valuePath={`${this.props.axis}.rotation`}
                labelText={messages.axisRotation.id}
                disabled={isDisabled}
                showDisabledMessage={!this.props.configPanelDisabled && isDisabled}
                properties={this.props.properties}
                pushData={this.props.pushData}
                items={getTranslatedDropdownItems(rotationDropdownItems, this.props.intl)}
            />
        );
    }

    private getControlProperties(): IVisualizationProperties {
        const axisProperties = this.props.properties?.controls?.[this.props.axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisLabelsEnabled = axisProperties?.labelsEnabled ?? true;
        const axisRotation = axisProperties?.rotation ?? "auto";

        return {
            axisVisible,
            axisLabelsEnabled,
            axisRotation,
        };
    }
}

export default injectIntl(LabelRotationControl);
