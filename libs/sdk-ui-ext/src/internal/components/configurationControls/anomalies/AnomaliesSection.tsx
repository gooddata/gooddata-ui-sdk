// (C) 2019-2026 GoodData Corporation

import { memo } from "react";

import { type IColor } from "@gooddata/sdk-model";

import { AnomalyColorControl } from "./AnomalyColorControl.js";
import { AnomalySensitivityControl } from "./AnomalySensitivityControl.js";
import { AnomalySizeControl } from "./AnomalySizeControl.js";
import { messages } from "../../../../locales.js";
import { type IColorConfiguration } from "../../../interfaces/Colors.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSection } from "../ConfigSection.js";
import { AnomalyIndicatorControl } from "./AnomalyIndicatorControl.js";

export interface IAnomaliesSection {
    controlsDisabled: boolean;
    enabled: boolean;
    colors: IColorConfiguration;
    properties: IVisualizationProperties | undefined;
    propertiesMeta: any;
    defaultAnomaliesEnabled?: boolean;
    pushData: ((data: any) => any) | undefined;
}

export const AnomaliesSection = memo(function AnomaliesSection({
    controlsDisabled = false,
    enabled = false,
    colors,
    properties = {},
    propertiesMeta = {},
    defaultAnomaliesEnabled = false,
    pushData = () => {},
}: IAnomaliesSection) {
    const defaultColor: IColor = {
        type: "rgb",
        value: {
            r: 255,
            g: 0,
            b: 0,
        },
    };
    const anomaliesEnabled = properties?.controls?.["anomalies"]?.enabled ?? defaultAnomaliesEnabled;
    const anomaliesSensitivity = properties?.controls?.["anomalies"]?.sensitivity ?? "medium";
    const anomaliesSize = properties?.controls?.["anomalies"]?.size ?? "small";
    const anomaliesColor = properties?.controls?.["anomalies"]?.color ?? defaultColor;
    const anomaliesToggleDisabledByVisualization = !(propertiesMeta?.anomalies_enabled ?? true);

    const toggleDisabled = controlsDisabled || anomaliesToggleDisabledByVisualization || !enabled;
    const forecastControlsDisabled = !anomaliesEnabled || toggleDisabled;
    const showDisabledMessage = controlsDisabled || anomaliesToggleDisabledByVisualization || !enabled;

    return (
        <ConfigSection
            id="anomalies_section"
            valuePath="anomalies.enabled"
            className="gd-anomalies-section adi-bucket-configuration"
            title={messages["anomaliesTitle"].id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            canBeToggled
            toggleDisabled={toggleDisabled}
            toggledOn={anomaliesEnabled}
            pushData={pushData}
            showDisabledMessage={showDisabledMessage}
            toggleMessageId={messages["anomaliesDisabledTooltip"].id}
        >
            <AnomalySensitivityControl
                disabled={forecastControlsDisabled}
                value={anomaliesSensitivity}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                pushData={pushData}
            />
            <AnomalyIndicatorControl title={messages["anomaliesIndicator"].id}>
                <AnomalyColorControl
                    colorPalette={colors.colorPalette}
                    disabled={forecastControlsDisabled}
                    value={anomaliesColor}
                    showDisabledMessage={showDisabledMessage}
                    properties={properties}
                    pushData={pushData}
                />
                <AnomalySizeControl
                    disabled={forecastControlsDisabled}
                    value={anomaliesSize}
                    showDisabledMessage={showDisabledMessage}
                    properties={properties}
                    pushData={pushData}
                />
            </AnomalyIndicatorControl>
        </ConfigSection>
    );
});
