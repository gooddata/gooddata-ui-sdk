// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import { messages } from "../../../../locales.js";
import { type IVisualizationProperties } from "../../../interfaces/Visualization.js";
import { ConfigSection } from "../ConfigSection.js";
import { GeoLegendPositionControl } from "./GeoLegendPositionControl.js";

type IGeoLegendPropertiesMeta = Record<string, { collapsed?: boolean } | boolean | undefined>;

interface IGeoLegendPushData {
    properties?: IVisualizationProperties;
    propertiesMeta?: Record<string, { collapsed: boolean }>;
}

export interface IGeoLegendSectionProps {
    controlsDisabled: boolean;
    properties?: IVisualizationProperties;
    propertiesMeta?: IGeoLegendPropertiesMeta;
    defaultLegendEnabled?: boolean;
    pushData?: (data: IGeoLegendPushData) => void;
}

export const GeoLegendSection = memo(function GeoLegendSection({
    controlsDisabled = false,
    properties = {},
    propertiesMeta = {},
    defaultLegendEnabled = true,
    pushData = () => {},
}: IGeoLegendSectionProps) {
    const legendEnabled = properties?.controls?.["legend"]?.enabled ?? defaultLegendEnabled;
    const legendPosition = properties?.controls?.["legend"]?.position ?? "auto";
    const legendToggleDisabledByVisualization = !(propertiesMeta?.["legend_enabled"] ?? true);

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
            <GeoLegendPositionControl
                disabled={legendPositionControlDisabled}
                value={legendPosition}
                showDisabledMessage={showDisabledMessage}
                properties={properties}
                pushData={pushData}
            />
        </ConfigSection>
    );
});
