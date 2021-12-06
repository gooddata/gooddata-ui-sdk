// (C) 2007-2020 GoodData Corporation
import React, { Component } from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";
import { Ldm } from "../../../md";
import { CUSTOM_COLOR_PALETTE } from "../../../constants/colors";

interface IConfigurationColumnChartExampleState {
    config: object;
    customPaletteUsed: boolean;
    customLegendUsed: boolean;
    customSeparatorUsed: boolean;
}

const style = { height: 300 };

export class ConfigurationColumnChartExample extends Component<
    unknown,
    IConfigurationColumnChartExampleState
> {
    state: IConfigurationColumnChartExampleState = {
        config: {},
        customPaletteUsed: false,
        customLegendUsed: true,
        customSeparatorUsed: true,
    };

    public onPaletteChange = (): void => {
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
    };

    public onLegendChange = (): void => {
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
    };

    public onSeparatorChange = (): void => {
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
    };

    public render(): React.ReactNode {
        const { config } = this.state;

        return (
            <div>
                <div className="s-insightView-column">
                    <button className="s-change-palette" onClick={this.onPaletteChange}>
                        Change palette
                    </button>

                    <button className="s-change-legend" onClick={this.onLegendChange}>
                        Change legend
                    </button>

                    <button className="s-change-separator" onClick={this.onSeparatorChange}>
                        Change separator
                    </button>

                    <div style={style}>
                        <InsightView insight={Ldm.Insights.ColumnsChart} config={config} />
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfigurationColumnChartExample;
