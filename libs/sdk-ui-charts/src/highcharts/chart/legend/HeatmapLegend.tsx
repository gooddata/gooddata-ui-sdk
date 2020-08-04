// (C) 2007-2018 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    IHeatmapLegendBox,
    IHeatmapLegendConfig,
    IHeatmapLegendLabel,
    getHeatmapLegendConfiguration,
} from "./helpers";
import { TOP } from "./PositionTypes";
import { IHeatmapLegendItem } from "../../typings/legend";

export interface IHeatmapLegendProps {
    series: IHeatmapLegendItem[];
    isSmall: boolean;
    format?: string;
    numericSymbols: string[];
    position: string;
}

function HeatmapLabels(labels: IHeatmapLegendLabel[]) {
    return (
        <div className="labels">
            {labels.map((item: IHeatmapLegendLabel) => {
                return (
                    <span key={item.key} style={item.style}>
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
                const classes = cx("box", box.class);

                return <span className={classes} key={box.key} style={box.style} />;
            })}
        </div>
    );
}

export default class HeatmapLegend extends React.PureComponent<IHeatmapLegendProps> {
    public render(): React.ReactNode {
        const { series, format, numericSymbols, isSmall, position } = this.props;

        const config: IHeatmapLegendConfig = getHeatmapLegendConfiguration(
            series,
            format,
            numericSymbols,
            isSmall,
            position,
        );
        const classes = cx(...config.classes);

        const renderLabelsFirst = config.position === TOP;

        return (
            <div className={classes}>
                {renderLabelsFirst && HeatmapLabels(config.labels)}
                {HeatmapBoxes(config.boxes)}
                {!renderLabelsFirst && HeatmapLabels(config.labels)}
            </div>
        );
    }
}
