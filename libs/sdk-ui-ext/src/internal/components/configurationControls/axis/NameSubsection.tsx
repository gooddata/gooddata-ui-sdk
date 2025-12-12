// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { NamePositionControl } from "./NamePositionControl.js";
import { messages } from "../../../../locales.js";
import { type IConfigItemSubsection } from "../../../interfaces/ConfigurationPanel.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSubsection } from "../../configurationControls/ConfigSubsection.js";

export const NameSubsection = memo(function NameSubsection(props: IConfigItemSubsection) {
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
            title={messages["axisName"].id}
            valuePath={`${axis}.name.visible`}
            properties={properties}
            pushData={pushData}
            canBeToggled
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
});
