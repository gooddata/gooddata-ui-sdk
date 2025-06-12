// (C) 2019-2022 GoodData Corporation
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ConfigSubsection from "../../configurationControls/ConfigSubsection.js";
import NamePositionControl from "./NamePositionControl.js";
import { IConfigItemSubsection } from "../../../interfaces/ConfigurationPanel.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

class NameSubsection extends React.PureComponent<IConfigItemSubsection & WrappedComponentProps> {
    public render() {
        const { axisVisible, axisNameVisible } = this.getControlProperties();
        const { axis, properties, pushData, disabled, configPanelDisabled } = this.props;

        return (
            <ConfigSubsection
                axisType={axis}
                title={messages.axisName.id}
                valuePath={`${axis}.name.visible`}
                properties={properties}
                pushData={pushData}
                canBeToggled={true}
                toggledOn={axisNameVisible}
                toggleDisabled={disabled || !axisVisible}
                showDisabledMessage={!configPanelDisabled && disabled}
            >
                <NamePositionControl
                    disabled={disabled}
                    configPanelDisabled={configPanelDisabled}
                    axis={axis}
                    properties={properties}
                    pushData={pushData}
                />
            </ConfigSubsection>
        );
    }

    private getControlProperties(): IVisualizationProperties {
        const axisProperties = this.props.properties?.controls?.[this.props.axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisNameVisible = axisProperties?.name?.visible ?? true;

        return {
            axisVisible,
            axisNameVisible,
        };
    }
}

export default injectIntl(NameSubsection);
