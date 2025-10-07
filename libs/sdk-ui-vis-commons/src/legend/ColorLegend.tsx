// (C) 2020-2025 GoodData Corporation

import { ReactElement, ReactNode } from "react";

import cx from "classnames";

import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import {
    IColorLegendBox,
    IColorLegendConfig,
    IHeatmapLegendLabel as IColorLegendLabel,
    getColorLegendConfiguration,
} from "./helpers.js";
import { BOTTOM, TOP } from "./PositionTypes.js";
import { IColorLegendItem, IColorLegendSize } from "./types.js";

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

export function ColorLabels({ labels }: IColorLabelsProps): ReactElement {
    return (
        <div className="labels" data-testid="color-legend-labels">
            {labels.map((item: IColorLegendLabel): ReactElement => {
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

export function ColorBoxes({ boxes }: IColorBoxesProps): ReactElement {
    return (
        <div className="boxes" data-testid="color-legend-boxes">
            {boxes.map((box: IColorLegendBox): ReactElement => {
                const classes = cx("box", box.class);
                const { key, style } = box;
                return <span className={classes} key={key} style={style} />;
            })}
        </div>
    );
}

function LegendBoxes({ renderLabelsFirst, boxes, labels }: ILegendBoxesProps): ReactElement {
    return (
        <>
            {renderLabelsFirst ? <ColorLabels labels={labels} /> : null}
            <ColorBoxes boxes={boxes} />
            {!renderLabelsFirst && <ColorLabels labels={labels} />}
        </>
    );
}

function LegendWithTitle({
    title,
    position,
    children,
}: {
    title: string;
    position: string;
    children: ReactNode;
}): ReactElement {
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
        <div className={classes} data-testid="color-legend">
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
