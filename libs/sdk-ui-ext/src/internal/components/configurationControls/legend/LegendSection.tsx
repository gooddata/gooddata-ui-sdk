// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { LegendPositionControl } from "./LegendPositionControl.js";
import { messages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSection } from "../ConfigSection.js";

export interface ILegendSection {
    controlsDisabled: boolean;
    properties?: IVisualizationProperties;
    propertiesMeta?: any;
    defaultLegendEnabled?: boolean;
    pushData?: (data: any) => any;
}

export const LegendSection = memo(function LegendSection({
    controlsDisabled = false,
    properties = {},
    propertiesMeta = {},
    defaultLegendEnabled = true,
    pushData = () => {},
}: ILegendSection) {
    const legendEnabled = properties?.controls?.["legend"]?.enabled ?? defaultLegendEnabled;
    const legendPosition = properties?.controls?.["legend"]?.position ?? "auto";
    const legendToggleDisabledByVisualization = !(propertiesMeta?.legend_enabled ?? true);

    const toggleDisabled = controlsDisabled || legendToggleDisabledByVisualization;
    const legendPositionControlDisabled = !legendEnabled || toggleDisabled;
    const showDisabledMessage = controlsDisabled || legendToggleDisabledByVisualization;

    return (
        <ConfigSection
            id="legend_section"
            valuePath="legend.enabled"
            title={messages["title"].id}
            propertiesMeta={propertiesMeta}
            properties={properties}
            canBeToggled
            toggleDisabled={toggleDisabled}
            toggledOn={legendEnabled}
            pushData={pushData}
            showDisabledMessage={showDisabledMessage}
        >
            <LegendPositionControl
                disabled={legendPositionControlDisabled}
                value={legendPosition}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSection>
    );
});
