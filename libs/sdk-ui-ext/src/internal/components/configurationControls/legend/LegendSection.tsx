// (C) 2019-2022 GoodData Corporation
import React from "react";
import ConfigSection from "../ConfigSection";
import LegendPositionControl from "./LegendPositionControl";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import { messages } from "../../../../locales";

export interface ILegendSection {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    pushData: (data: any) => any;
}

class LegendSection extends React.PureComponent<ILegendSection> {
    public render(): React.ReactNode {
        const { controlsDisabled, properties, pushData } = this.props;

        const legendEnabled = this.props.properties?.controls?.legend?.enabled ?? true;
        const legendPosition = this.props.properties?.controls?.legend?.position ?? "auto";
        const legendToggleDisabledByVisualization = !(this.props.propertiesMeta?.legend_enabled ?? true);

        const toggleDisabled = controlsDisabled || legendToggleDisabledByVisualization;
        const legendPositionControlDisabled = !legendEnabled || toggleDisabled;
        const showDisabledMessage = controlsDisabled || legendToggleDisabledByVisualization;

        return (
            <ConfigSection
                id="legend_section"
                valuePath="legend.enabled"
                title={messages.title.id}
                propertiesMeta={this.props.propertiesMeta}
                properties={properties}
                canBeToggled={true}
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
    }
}

export default LegendSection;
