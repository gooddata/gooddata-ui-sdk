// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as classNames from 'classnames';
import {
    IHeatmapLegendBox,
    IHeatmapLegendConfig,
    IHeatmapLegendSerie,
    IHeatmapLegendLabel,
    getHeatmapLegendConfiguration
} from './helpers';

export interface IHeatmapLegendProps {
    series: IHeatmapLegendSerie[];
    isSmall: boolean;
    format?: string;
    numericSymbols: string[];
}

function HeatmapLabels(labels: IHeatmapLegendLabel[]) {
    return (
        <div className="labels">
            {labels.map((item: IHeatmapLegendLabel) => {
                return (
                        <span
                            className={item.class}
                            key={item.key}
                        >
                            {item.label}
                        </span>
                );
            })}
        </div>
    );
}

function HeatmapBoxes(boxes: IHeatmapLegendBox[]) {
    return (
        <div className="boxes">
            {boxes.map((box: IHeatmapLegendBox) => {
                const classes = classNames('box', box.class);

                return (
                    <span className={classes} key={box.key} style={box.style} />
                );
            })}
        </div>
    );
}

export default class HeatmapLegend extends React.PureComponent<IHeatmapLegendProps> {
    public render() {
        const { series, format, numericSymbols, isSmall } = this.props;

        const config: IHeatmapLegendConfig = getHeatmapLegendConfiguration(series, format, numericSymbols, isSmall);
        const classes = classNames(...config.classes);

        return (
            <div className={classes}>
                {HeatmapLabels(config.labels)}
                {HeatmapBoxes(config.boxes)}
            </div>
        );
    }
}
