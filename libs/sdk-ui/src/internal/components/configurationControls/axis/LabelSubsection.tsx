// (C) 2019 GoodData Corporation
import * as React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ConfigSubsection from "../../configurationControls/ConfigSubsection";
import get = require("lodash/get");
import { AxisType } from "../../../interfaces/AxisType";
import LabelRotationControl from "./LabelRotationControl";
import { IVisualizationProperties } from "../../../interfaces/Visualization";

export interface ILabelSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
}

class LabelSubsection extends React.PureComponent<ILabelSubsection & WrappedComponentProps, {}> {
    public render() {
        const { axisVisible, axisLabelsEnabled } = this.getControlProperties();

        return (
            <ConfigSubsection
                title="properties.axis.labels"
                valuePath={`${this.props.axis}.labelsEnabled`}
                properties={this.props.properties}
                pushData={this.props.pushData}
                canBeToggled={true}
                toggledOn={axisLabelsEnabled}
                toggleDisabled={this.props.disabled || !axisVisible}
                showDisabledMessage={!this.props.configPanelDisabled && this.props.disabled}
            >
                <LabelRotationControl
                    disabled={this.props.disabled}
                    configPanelDisabled={this.props.configPanelDisabled}
                    axis={this.props.axis}
                    properties={this.props.properties}
                    pushData={this.props.pushData}
                />
            </ConfigSubsection>
        );
    }

    private getControlProperties() {
        const axisVisible = get(this.props, `properties.controls.${this.props.axis}.visible`, true);
        const axisLabelsEnabled = get(
            this.props,
            `properties.controls.${this.props.axis}.labelsEnabled`,
            true,
        );

        return {
            axisVisible,
            axisLabelsEnabled,
        };
    }
}

export default injectIntl(LabelSubsection);
