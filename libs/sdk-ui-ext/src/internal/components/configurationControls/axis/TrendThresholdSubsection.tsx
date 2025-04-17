// (C) 2025 GoodData Corporation

import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import set from "lodash/set.js";
import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";
import { IPushData } from "@gooddata/sdk-ui";

import { AxisType } from "../../../interfaces/AxisType.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import ConfigSubsection from "../ConfigSubsection.js";
import { messages } from "../../../../locales.js";
import InputControl from "../InputControl.js";

export interface ITrendThresholdSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
    propertiesMeta: any;
}

class TrendThresholdSubsection extends React.PureComponent<
    ITrendThresholdSubsection & WrappedComponentProps
> {
    public render() {
        const axisProperties = this.props.properties?.controls?.[this.props.axis];
        const axisVisible = axisProperties?.visible ?? true;
        const axisThresholdEnabled = axisProperties?.thresholds?.enabled ?? false;
        const trendThreshold = axisProperties?.thresholds?.trendThreshold ?? "";

        return (
            <ConfigSubsection
                axisType={this.props.axis}
                title={messages.thresholds.id}
                valuePath={`${this.props.axis}.thresholds.enabled`}
                properties={this.props.properties}
                pushData={this.props.pushData}
                canBeToggled={true}
                toggledOn={axisThresholdEnabled}
                toggleDisabled={this.props.disabled || !axisVisible}
                showDisabledMessage={!this.props.configPanelDisabled && this.props.disabled}
            >
                <InputControl
                    valuePath={`${this.props.axis}.thresholds.trendThreshold`}
                    labelText={messages.trendThreshold.id}
                    placeholder={messages.noThreshold.id}
                    type="number"
                    value={trendThreshold}
                    disabled={this.props.disabled || !axisVisible || !axisThresholdEnabled}
                    properties={this.props.properties}
                    pushData={this.trendThresholdInputValidateAndPushDataCallback}
                />
            </ConfigSubsection>
        );
    }

    private trendThresholdInputValidateAndPushDataCallback = (data: IPushData): void => {
        const { properties } = data;

        const value = properties?.controls?.[this.props.axis]?.thresholds.trendThreshold;
        const sanitizedValue = isEmpty(value) ? undefined : parseInt(value, 10);

        const clonedProperties = cloneDeep(properties);
        set(clonedProperties, `controls.${this.props.axis}.thresholds.trendThreshold`, sanitizedValue);

        this.props.pushData({ properties: clonedProperties });
    };
}

export default injectIntl(TrendThresholdSubsection);
