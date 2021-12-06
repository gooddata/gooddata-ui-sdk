// (C) 2007-2019 GoodData Corporation
import React, { useState } from "react";
import { BarChart } from "@gooddata/sdk-ui-charts";
import { Md, MdExt } from "../../md";

const config = {
    enableCompactSize: true,
};

interface SizeButtonProps {
    callback: (height: number) => void;
    height: number;
    currentHeight: number | null;
}

const SizeButton: React.FC<SizeButtonProps> = (props: SizeButtonProps) => {
    const { callback, height, currentHeight } = props;
    return (
        <button
            onClick={() => callback(height)}
            className={`gd-button gd-button-secondary ${height === currentHeight ? "is-active" : ""}`}
        >
            {height}
        </button>
    );
};

export const BarChartResponsiveExample: React.FC = () => {
    const [draggable, setDraggable] = useState(false);
    const [height, setHeight] = useState(300);
    const resize = (size: number) => {
        setDraggable(false);
        setHeight(size);
    };
    const currentHeight = draggable ? null : height;
    const baseStyle: React.CSSProperties = {
        minWidth: 400,
        minHeight: 80,
        maxWidth: "100%",
        maxHeight: 300,
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
            <SizeButton callback={resize} height={80} currentHeight={currentHeight} />
            <SizeButton callback={resize} height={100} currentHeight={currentHeight} />
            <SizeButton callback={resize} height={300} currentHeight={currentHeight} />
            <button
                onClick={() => {
                    setHeight(310);
                    setDraggable(true);
                }}
                className={`gd-button gd-button-secondary s-resize-draggable ${draggable ? "is-active" : ""}`}
            >
                Resizable by dragging
            </button>
            <hr className="separator" />
            <div style={divStyle}>
                <BarChart measures={[MdExt.TotalSales1]} viewBy={Md.LocationResort} config={config} />
            </div>
        </div>
    );
};
