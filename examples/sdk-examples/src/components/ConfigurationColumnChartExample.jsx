// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Visualization } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import { columnsVisualizationIdentifier, projectId } from "../utils/fixtures";
import { CUSTOM_COLOR_PALETTE } from "../utils/colors";

const defaultProperties = {};

export class ConfigurationColumnChartExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            config: defaultProperties,
            customPaletteUsed: false,
            customLegendUsed: true,
            customSeparatorUsed: true,
        };
        this.onPaletteChange = this.onPaletteChange.bind(this);
        this.onLegendChange = this.onLegendChange.bind(this);
        this.onSeparatorChange = this.onSeparatorChange.bind(this);
    }

    onPaletteChange() {
        const { config: currentConfig, customPaletteUsed } = this.state;
        const colorPaletteProp = {
            colorPalette: customPaletteUsed ? undefined : CUSTOM_COLOR_PALETTE,
        };
        this.setState({
            config: {
                ...currentConfig,
                ...colorPaletteProp,
            },
            customPaletteUsed: !customPaletteUsed,
        });
    }

    onLegendChange() {
        const { config: currentConfig, customLegendUsed } = this.state;
        const legendProp = {
            legend: {
                enabled: customLegendUsed,
                position: "right",
            },
        };
        this.setState({
            config: {
                ...currentConfig,
                ...legendProp,
            },
            customLegendUsed: !customLegendUsed,
        });
    }

    onSeparatorChange() {
        const { config: currentConfig, customSeparatorUsed } = this.state;
        const separatorProp = {
            separators: customSeparatorUsed
                ? { thousand: ".", decimal: "," }
                : { thousand: ",", decimal: "." },
        };
        this.setState({
            config: {
                ...currentConfig,
                ...separatorProp,
            },
            customSeparatorUsed: !customSeparatorUsed,
        });
    }

    render() {
        const { config } = this.state;

        return (
            <div>
                <div style={{ height: 300 }} className="s-visualization-column">
                    <button className="s-change-palette" onClick={this.onPaletteChange}>
                        Change palette
                    </button>

                    <button className="s-change-legend" onClick={this.onLegendChange}>
                        Change legend
                    </button>

                    <button className="s-change-separator" onClick={this.onSeparatorChange}>
                        Change separator
                    </button>

                    <Visualization
                        projectId={projectId}
                        identifier={columnsVisualizationIdentifier}
                        config={config}
                    />
                </div>
            </div>
        );
    }
}

export default ConfigurationColumnChartExample;
