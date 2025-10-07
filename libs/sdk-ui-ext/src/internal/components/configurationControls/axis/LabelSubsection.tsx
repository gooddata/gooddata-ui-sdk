// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { LabelFormatControl } from "./LabelFormatControl.js";
import LabelRotationControl from "./LabelRotationControl.js";
import { messages } from "../../../../locales.js";
import { AxisType } from "../../../interfaces/AxisType.js";
import { IVisualizationProperties } from "../../../interfaces/Visualization.js";
import ConfigSubsection from "../../configurationControls/ConfigSubsection.js";

export interface ILabelSubsection {
    disabled: boolean;
    configPanelDisabled: boolean;
    axis: AxisType;
    properties: IVisualizationProperties;
    pushData: (data: any) => any;
    showFormat?: boolean;
}

function LabelSubsection(props: ILabelSubsection & WrappedComponentProps) {
    const getControlProperties = (): IVisualizationProperties => {
        const axisProperties = props.properties?.controls?.[props.axis];

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
            axisType={props.axis}
            title={messages["axisLabels"].id}
            valuePath={`${props.axis}.labelsEnabled`}
            properties={props.properties}
            pushData={props.pushData}
            canBeToggled
            toggledOn={axisLabelsEnabled}
            toggleDisabled={props.disabled || !axisVisible}
            showDisabledMessage={!props.configPanelDisabled && props.disabled}
        >
            {props.showFormat ? (
                <LabelFormatControl
                    disabled={props.disabled}
                    configPanelDisabled={props.configPanelDisabled}
                    axis={props.axis}
                    properties={props.properties}
                    pushData={props.pushData}
                />
            ) : null}
            <LabelRotationControl
                disabled={props.disabled}
                configPanelDisabled={props.configPanelDisabled}
                axis={props.axis}
                properties={props.properties}
                pushData={props.pushData}
            />
        </ConfigSubsection>
    );
}

export default memo(injectIntl(LabelSubsection));
