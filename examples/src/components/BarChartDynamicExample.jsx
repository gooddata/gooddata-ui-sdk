// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { BarChart, Model } from "@gooddata/react-components";

import "@gooddata/react-components/styles/css/main.css";

import {
    totalSalesIdentifier,
    locationResortIdentifier,
    menuCategoryAttributeDFIdentifier,
    projectId,
} from "../utils/fixtures";
import { CUSTOM_COLOR_PALETTE } from "../utils/colors";

const defaultProperties = {};

export class BarChartDynamicExample extends Component {
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

        const amount = Model.measure(totalSalesIdentifier)
            .format("#,##0")
            .alias("$ Total Sales");

        const locationResort = Model.attribute(locationResortIdentifier).localIdentifier("location_resort");

        const menuCategory = Model.attribute(menuCategoryAttributeDFIdentifier).localIdentifier(
            menuCategoryAttributeDFIdentifier,
        );

        return (
            <div>
                <div style={{ height: 300 }} className="s-bar-chart">
                    <button className="s-change-palette" onClick={this.onPaletteChange}>
                        Change palette
                    </button>

                    <button className="s-change-legend" onClick={this.onLegendChange}>
                        Change legend
                    </button>

                    <button className="s-change-separator" onClick={this.onSeparatorChange}>
                        Change separator
                    </button>

                    <BarChart
                        projectId={projectId}
                        measures={[amount]}
                        viewBy={locationResort}
                        stackBy={menuCategory}
                        config={config}
                    />
                </div>
            </div>
        );
    }
}

export default BarChartDynamicExample;
