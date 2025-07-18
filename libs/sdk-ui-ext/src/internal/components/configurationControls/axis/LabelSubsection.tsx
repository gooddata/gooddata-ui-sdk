// (C) 2019-2025 GoodData Corporation
import { memo } from "react";
import ConfigSubsection from "../../configurationControls/ConfigSubsection.js";
import { AxisType } from "../../../interfaces/AxisType.js";
import LabelRotationControl from "./LabelRotationControl.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { messages } from "../../../../locales.js";

import { LabelFormatControl } from "./LabelFormatControl.js";

export interface ILabelSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
    showFormat?: boolean;
}

const LabelSubsection = memo(function LabelSubsection({
    disabled,
    configPanelDisabled,
    axis,
    properties,
    pushData,
    showFormat,
}: ILabelSubsection) {
    const getControlProperties = (): IVisualizationProperties => {
        const axisProperties = properties?.controls?.[axis];

        const axisVisible = axisProperties?.visible ?? true;
        const axisLabelsEnabled = axisProperties?.labelsEnabled ?? true;

        return {
            axisVisible,
            axisLabelsEnabled,
        };
    };

    const { axisVisible, axisLabelsEnabled } = getControlProperties();

    return (
        <ConfigSubsection
            axisType={axis}
            title={messages.axisLabels.id}
            valuePath={`${axis}.labelsEnabled`}
            properties={properties}
            pushData={pushData}
            canBeToggled={true}
            toggledOn={axisLabelsEnabled}
            toggleDisabled={disabled || !axisVisible}
            showDisabledMessage={!configPanelDisabled && disabled}
        >
            {showFormat ? (
                <LabelFormatControl
                    disabled={disabled}
                    configPanelDisabled={configPanelDisabled}
                    axis={axis}
                    properties={properties}
                    pushData={pushData}
                />
            ) : null}
            <LabelRotationControl
                disabled={disabled}
                configPanelDisabled={configPanelDisabled}
                axis={axis}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSubsection>
    );
});

export default LabelSubsection;
