// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ConfigSubsection from "../../configurationControls/ConfigSubsection.js";
import NamePositionControl from "./NamePositionControl.js";
import { IConfigItemSubsection } from "../../../interfaces/ConfigurationPanel.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

function NameSubsection(props: IConfigItemSubsection & WrappedComponentProps) {
    const getControlProperties = (): IVisualizationProperties => {
        const axisProperties = props.properties?.controls?.[props.axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisNameVisible = axisProperties?.name?.visible ?? true;

        return {
            axisVisible,
            axisNameVisible,
        };
    };

    const { axisVisible, axisNameVisible } = getControlProperties();
    const { axis, properties, pushData, disabled, configPanelDisabled } = props;

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

export default injectIntl(memo(NameSubsection));
