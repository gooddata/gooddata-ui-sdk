// (C) 2020-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    IColorLegendBox,
    IColorLegendConfig,
    IHeatmapLegendLabel as IColorLegendLabel,
    getColorLegendConfiguration,
} from "./helpers.js";
import { TOP, BOTTOM } from "./PositionTypes.js";
import { IColorLegendItem, IColorLegendSize } from "./types.js";
import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

/**
 * @internal
 */
export interface IColorLegendProps {
    data: IColorLegendItem[];
    numericSymbols: string[];
    position: string;
    size?: IColorLegendSize;
    format?: string;
    theme?: ITheme;
    title?: string;
}

interface IColorLabelsProps {
    labels: IColorLegendLabel[];
}

interface IColorBoxesProps {
    boxes: IColorLegendBox[];
}

interface ILegendBoxesProps {
    renderLabelsFirst: boolean;
    boxes: IColorLegendBox[];
    labels: IColorLegendLabel[];
}

export function ColorLabels(colorLabelProps: IColorLabelsProps): JSX.Element {
    const { labels } = colorLabelProps;
    return (
        <div className="labels" aria-label="Color labels">
            {labels.map((item: IColorLegendLabel): JSX.Element => {
                const { key, label, style } = item;
                return (
                    <span key={key} style={style}>
                        {label}
                    </span>
                );
            })}
        </div>
    );
}

export function ColorBoxes(colorBoxProps: IColorBoxesProps): JSX.Element {
    const { boxes } = colorBoxProps;
    return (
        <div className="boxes" aria-label="Color boxes">
            {boxes.map((box: IColorLegendBox): JSX.Element => {
                const classes = cx("box", box.class);
                const { key, style } = box;
                return <span className={classes} key={key} style={style} />;
            })}
        </div>
    );
}

function LegendBoxes({ renderLabelsFirst, boxes, labels }: ILegendBoxesProps): JSX.Element {
    return (
        <>
            {renderLabelsFirst ? <ColorLabels labels={labels} /> : null}
            <ColorBoxes boxes={boxes} />
            {!renderLabelsFirst && <ColorLabels labels={labels} />}
        </>
    );
}

function LegendWithTitle(props: { title: string; position: string; children: React.ReactNode }): JSX.Element {
    const { title, position, children } = props;
    const isHorizontal = position === TOP || position === BOTTOM;
    const classes = cx("heatmap-legend-with-title", { horizontal: isHorizontal });
    return (
        <div className={classes}>
            <div className="heatmap-legend-title">{`${title}:`}</div>
            <div className="heatmap-legend-boxes">{children}</div>
        </div>
    );
}

/**
 * @internal
 */
export const ColorLegend = withTheme((colorLegendProps: IColorLegendProps) => {
    const { title, data, format, numericSymbols, size = "large", position, theme } = colorLegendProps;
    if (!data.length) {
        return null;
    }

    const config: IColorLegendConfig = getColorLegendConfiguration(
        data,
        format,
        numericSymbols,
        size,
        position,
        theme,
    );
    const classes = cx(...config.classes);
    const renderLabelsFirst = config.position === TOP;
    const { boxes, labels } = config;

    return (
        <div className={classes} aria-label="Color legend">
            {title ? (
                <LegendWithTitle title={title} position={position}>
                    <LegendBoxes renderLabelsFirst={renderLabelsFirst} boxes={boxes} labels={labels} />
                </LegendWithTitle>
            ) : (
                <LegendBoxes renderLabelsFirst={renderLabelsFirst} boxes={boxes} labels={labels} />
            )}
        </div>
    );
});
