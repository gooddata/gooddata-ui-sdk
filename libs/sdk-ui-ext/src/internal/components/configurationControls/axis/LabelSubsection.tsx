// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ConfigSubsection from "../../configurationControls/ConfigSubsection";
import { AxisType } from "../../../interfaces/AxisType";
import LabelRotationControl from "./LabelRotationControl";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import { messages } from "../../../../locales";

import { LabelFormatControl } from "./LabelFormatControl";

export interface ILabelSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
    showFormat?: boolean;
}

class LabelSubsection extends React.PureComponent<ILabelSubsection & WrappedComponentProps> {
    public render() {
        const { axisVisible, axisLabelsEnabled } = this.getControlProperties();

        return (
            <ConfigSubsection
                axisType={this.props.axis}
                title={messages.axisLabels.id}
                valuePath={`${this.props.axis}.labelsEnabled`}
                properties={this.props.properties}
                pushData={this.props.pushData}
                canBeToggled={true}
                toggledOn={axisLabelsEnabled}
                toggleDisabled={this.props.disabled || !axisVisible}
                showDisabledMessage={!this.props.configPanelDisabled && this.props.disabled}
            >
                {this.props.showFormat && (
                    <LabelFormatControl
                        disabled={this.props.disabled}
                        configPanelDisabled={this.props.configPanelDisabled}
                        axis={this.props.axis}
                        properties={this.props.properties}
                        pushData={this.props.pushData}
                    />
                )}
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

    private getControlProperties(): IVisualizationProperties {
        const axisProperties = this.props.properties?.controls?.[this.props.axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisLabelsEnabled = axisProperties?.labelsEnabled ?? true;

        return {
            axisVisible,
            axisLabelsEnabled,
        };
    }
}

export default injectIntl(LabelSubsection);
