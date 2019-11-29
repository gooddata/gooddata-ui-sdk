// (C) 2019 GoodData Corporation
import * as React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import get = require("lodash/get");

import DropdownControl from "../DropdownControl";
import { getTranslatedDropdownItems } from "../../../utils/translations";
import { rotationDropdownItems } from "../../../constants/dropdowns";
import { AxisType } from "../../../interfaces/AxisType";
import { IVisualizationProperties } from "../../../interfaces/Visualization";

export interface ILabelRotationControl {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

class LabelRotationControl extends React.PureComponent<ILabelRotationControl & WrappedComponentProps, {}> {
    public render() {
        const { axisVisible, axisLabelsEnabled, axisRotation } = this.getControlProperties();

        const isDisabled = this.props.disabled || !axisVisible || !axisLabelsEnabled;
        return (
            <DropdownControl
                value={axisRotation}
                valuePath={`${this.props.axis}.rotation`}
                labelText="properties.axis.rotation"
                disabled={isDisabled}
                showDisabledMessage={!this.props.configPanelDisabled && isDisabled}
                properties={this.props.properties}
                pushData={this.props.pushData}
                items={getTranslatedDropdownItems(rotationDropdownItems, this.props.intl)}
            />
        );
    }

    private getControlProperties() {
        const axisVisible = get(this.props, `properties.controls.${this.props.axis}.visible`, true);
        const axisLabelsEnabled = get(
            this.props,
            `properties.controls.${this.props.axis}.labelsEnabled`,
            true,
        );
        const axisRotation = get(this.props, `properties.controls.${this.props.axis}.rotation`, "auto");

        return {
            axisVisible,
            axisLabelsEnabled,
            axisRotation,
        };
    }
}

export default injectIntl(LabelRotationControl);
