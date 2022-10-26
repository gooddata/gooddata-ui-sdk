// (C) 2007-2022 GoodData Corporation
import React, { useState } from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";
import * as Md from "../../../md/full";
import { CUSTOM_COLOR_PALETTE } from "../../../constants/colors";

interface IConfigurationColumnChartExampleState {
    config: object;
    customPaletteUsed: boolean;
    customLegendUsed: boolean;
    customSeparatorUsed: boolean;
}

const style = { height: 300 };

const ColumnChartConfigurationExample: React.FC = () => {
    const [state, setState] = useState<IConfigurationColumnChartExampleState>(() => {
        return {
            config: {},
            customPaletteUsed: false,
            customLegendUsed: true,
            customSeparatorUsed: true,
        };
    });

    const onPaletteChange = (): void => {
        setState((prevState) => {
            const { config: currentConfig, customPaletteUsed } = prevState;
            const colorPaletteProp = {
                colorPalette: customPaletteUsed ? undefined : CUSTOM_COLOR_PALETTE,
            };

            return {
                ...prevState,
                config: {
                    ...currentConfig,
                    ...colorPaletteProp,
                },
                customPaletteUsed: !customPaletteUsed,
            };
        });
    };

    const onLegendChange = (): void => {
        setState((prevState) => {
            const { config: currentConfig, customLegendUsed } = prevState;
            const legendProp = {
                legend: {
                    enabled: customLegendUsed,
                    position: "right",
                },
            };

            return {
                ...prevState,
                config: {
                    ...currentConfig,
                    ...legendProp,
                },
                customLegendUsed: !customLegendUsed,
            };
        });
    };

    const onSeparatorChange = (): void => {
        setState((prevState) => {
            const { config: currentConfig, customSeparatorUsed } = prevState;
            const separatorProp = {
                separators: customSeparatorUsed
                    ? { thousand: ".", decimal: "," }
                    : { thousand: ",", decimal: "." },
            };

            return {
                ...prevState,
                config: {
                    ...currentConfig,
                    ...separatorProp,
                },
                customSeparatorUsed: !customSeparatorUsed,
            };
        });
    };

    return (
        <div className="s-insightView-column">
            <button className="s-change-palette" onClick={onPaletteChange}>
                Change palette
            </button>
            <button className="s-change-legend" onClick={onLegendChange}>
                Change legend
            </button>
            <button className="s-change-separator" onClick={onSeparatorChange}>
                Change separator
            </button>

            <div style={style}>
                <InsightView insight={Md.Insights.ColumnsChart} config={state.config} />
            </div>
        </div>
    );
};

export default ColumnChartConfigurationExample;
