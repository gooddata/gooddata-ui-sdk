// (C) 2019 GoodData Corporation
import * as React from "react";
import { InjectedIntl } from "react-intl";
import ConfigSection from "../ConfigSection";
import LegendPositionControl from "./LegendPositionControl";
import { IVisualizationProperties } from "../../../interfaces/Visualization";
import get = require("lodash/get");

export interface ILegendSection {
    controlsDisabled: boolean;
    properties: IVisualizationProperties;
    propertiesMeta: any;
    intl: InjectedIntl;
    pushData: (data: any) => any;
}

export default class LegendSection extends React.PureComponent<ILegendSection, {}> {
    public render() {
        const { controlsDisabled, properties, intl, pushData } = this.props;

        const legendEnabled = get(this.props, "properties.controls.legend.enabled", true);
        const legendPosition = get(this.props, "properties.controls.legend.position", "auto");
        const legendToggleDisabledByVisualization = !get(this.props, "propertiesMeta.legend_enabled", true);

        const toggleDisabled = controlsDisabled || legendToggleDisabledByVisualization;
        const legendPositionControlDisabled = !legendEnabled || toggleDisabled;
        const showDisabledMessage = !controlsDisabled && legendToggleDisabledByVisualization;

        return (
            <ConfigSection
                id="legend_section"
                valuePath="legend.enabled"
                title="properties.legend.title"
                intl={intl}
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
                    intl={intl}
                    properties={properties}
                    pushData={pushData}
                />
            </ConfigSection>
        );
    }
}
