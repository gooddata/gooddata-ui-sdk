// (C) 2020-2023 GoodData Corporation
import React from "react";
import cx from "classnames";
import { calculateAverage } from "../helpers/geoChart/common.js";
import { formatLegendLabel } from "@gooddata/sdk-ui-vis-commons";

export interface IPushpinSizeLegendProps {
    format: string;
    numericSymbols: string[];
    sizes: Array<number | null>;
    measureName?: string;
    isSmall: boolean;
    showMiddleCircle: boolean;
}

export default function PushpinSizeLegend(props: IPushpinSizeLegendProps): JSX.Element | null {
    const { sizes = [], format, numericSymbols = [], measureName, isSmall, showMiddleCircle } = props;
    const sizeData = getSizeData(sizes);

    if (!sizeData.length) {
        return null;
    }

    const min = getMin(sizeData);
    const max = getMax(sizeData);

    if (min === max) {
        return null;
    }

    const diff: number = max - min;
    const classNamesContainer = cx("pushpin-size-legend s-pushpin-size-legend", {
        "is-small-container": isSmall,
    });
    const classNamesCircles = cx("pushpin-size-legend-circle-list", { "is-small-circles": isSmall });

    return (
        <div className={classNamesContainer}>
            {measureName ? (
                <div className="metric-name" title={measureName}>
                    {measureName}:
                </div>
            ) : null}
            <div className={classNamesCircles}>
                <div className="pushpin-size-legend-circle circle-min-value">
                    <span className="circle-min-icon" />
                    <span className="circle-value">
                        {formatLegendLabel(min, format, diff, numericSymbols)}
                    </span>
                </div>
                {showMiddleCircle ? renderMiddleCircle(props) : null}
                {!measureName ? <div className="circle-separator" /> : null}
                <div className="pushpin-size-legend-circle circle-max-value">
                    <span className="circle-max-icon" />
                    <span className="circle-value">
                        {formatLegendLabel(max, format, diff, numericSymbols)}
                    </span>
                </div>
            </div>
        </div>
    );
}

function renderMiddleCircle(props: IPushpinSizeLegendProps) {
    const { sizes = [], format, numericSymbols = [], measureName } = props;
    const sizeData = getSizeData(sizes);
    const diff = getMax(sizeData) - getMin(sizeData);

    return (
        <React.Fragment>
            {!measureName && <div className="circle-separator" />}
            <div className="pushpin-size-legend-circle circle-average-value">
                <span className="circle-average-icon" />
                <span className="circle-value">
                    {formatLegendLabel(calculateAverage(sizeData), format, diff, numericSymbols)}
                </span>
            </div>
        </React.Fragment>
    );
}

function getSizeData(sizes: Array<number | null>): number[] {
    return sizes.filter((value) => value !== null && isFinite(value) && !isNaN(value)) as number[];
}

function getMin(sizeData: number[]) {
    return Math.min(...sizeData);
}

function getMax(sizeData: number[]) {
    return Math.max(...sizeData);
}
