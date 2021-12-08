// (C) 2007-2021 GoodData Corporation
import React, { useState } from "react";
import { ColumnChart, IChartConfig, PositionType } from "@gooddata/sdk-ui-charts";
import { modifyMeasure } from "@gooddata/sdk-model";

import { Md } from "../../md";

const TotalSales = modifyMeasure(Md.$TotalSales, (m) => m.format("#,##0").alias("$ Total Sales"));

const getConfig = (position: PositionType, responsive: boolean | "autoPositionWithPopup"): IChartConfig => ({
    legend: {
        responsive,
        position,
    },
});

interface IPositionButtonProps {
    position: PositionType;
    currentPosition: PositionType;
    callback: (pos: PositionType) => void;
}

const PositionButton: React.FC<IPositionButtonProps> = (props: IPositionButtonProps) => {
    const { position, currentPosition, callback } = props;
    return (
        <button
            onClick={() => callback(position)}
            className={`gd-button gd-button-secondary ${position === currentPosition ? "is-active" : ""}`}
        >
            position: {position}
        </button>
    );
};

interface ISizeButtonProps {
    callback: (size: [number, number]) => void;
    width: number;
    height: number;
    currentWidth: number | null;
    currentHeight: number | null;
}

const SizeButton: React.FC<ISizeButtonProps> = (props: ISizeButtonProps) => {
    const { callback, width, height, currentWidth, currentHeight } = props;
    return (
        <button
            onClick={() => callback([width, height])}
            className={`gd-button gd-button-secondary ${
                width === currentWidth && height === currentHeight ? "is-active" : ""
            }`}
        >
            {width}x{height}
        </button>
    );
};

interface IResponsiveButtonProps {
    responsive: boolean | "autoPositionWithPopup";
    currentResponsive: boolean | "autoPositionWithPopup";
    callback: (res: boolean | "autoPositionWithPopup") => void;
}

const ResponsiveButton: React.FC<IResponsiveButtonProps> = (props: IResponsiveButtonProps) => {
    const { responsive, currentResponsive, callback } = props;
    return (
        <button
            onClick={() => callback(responsive)}
            className={`gd-button gd-button-secondary ${responsive === currentResponsive ? "is-active" : ""}`}
        >
            responsive: {String(responsive)}
        </button>
    );
};

export const ColumnChartResponsiveLegendExample: React.FC = () => {
    const [[width, height], setSize] = useState<[number, number]>([610, 370]);

    const [draggable, setDraggable] = useState(false);
    const resize = (size: [number, number]) => {
        setDraggable(false);
        setSize(size);
    };

    const [responsive, setResponsive] = useState<boolean | "autoPositionWithPopup">(false);
    const [position, setPosition] = useState<PositionType>("left");
    const currentWidth = draggable ? null : width;
    const currentHeight = draggable ? null : height;

    const baseStyle: React.CSSProperties = {
        minWidth: 100,
        minHeight: 200,
        maxWidth: "100%",
        maxHeight: 300,
        width,
        height,
    };

    const divStyle: React.CSSProperties = draggable
        ? {
              ...baseStyle,
              resize: "both",
              overflow: "auto",
              border: "2px dashed #eaeaea",
          }
        : {
              ...baseStyle,
              resize: "none",
          };

    return (
        <div>
            <PositionButton position="left" currentPosition={position} callback={setPosition} />
            <PositionButton position="top" currentPosition={position} callback={setPosition} />

            <hr className="separator-inner" />

            <ResponsiveButton responsive={false} currentResponsive={responsive} callback={setResponsive} />
            <ResponsiveButton
                responsive={"autoPositionWithPopup"}
                currentResponsive={responsive}
                callback={setResponsive}
            />

            <hr className="separator-inner" />

            <SizeButton
                width={260}
                height={200}
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                callback={resize}
            />
            <SizeButton
                width={180}
                height={300}
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                callback={resize}
            />
            <SizeButton
                width={440}
                height={160}
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                callback={resize}
            />
            <SizeButton
                width={610}
                height={160}
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                callback={resize}
            />
            <SizeButton
                width={610}
                height={370}
                currentWidth={currentWidth}
                currentHeight={currentHeight}
                callback={resize}
            />
            <button
                onClick={() => {
                    setSize([620, 380]);
                    setDraggable(true);
                }}
                className={`gd-button gd-button-secondary s-resize-draggable ${draggable ? "is-active" : ""}`}
            >
                Resizable by dragging
            </button>

            <hr className="separator" />
            <div style={divStyle} className="s-resizable-vis">
                <ColumnChart
                    measures={[TotalSales]}
                    viewBy={Md.LocationState}
                    stackBy={Md.MenuCategory}
                    config={getConfig(position, responsive)}
                />
            </div>
        </div>
    );
};
