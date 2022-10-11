// (C) 2007-2022 GoodData Corporation
import React from "react";

const baseAnimationDuration = 1.8;

interface ICustomLoadingProps {
    color?: string;
    speed?: number;
    inline?: boolean;
    height?: string | number;
    width?: string | number;
    imageHeight?: string | number;
    imageWidth?: string | number;
    label?: string;
}

export const CustomLoading: React.FC<ICustomLoadingProps> = ({
    label = null,
    inline = false,
    height = "100%",
    width,
    imageHeight = 38,
    imageWidth,
    color = "#14b2e2",
    speed = 1,
}) => {
    const wrapperStyle: React.CSSProperties = {
        textAlign: "center",
        display: inline ? "inline-flex" : "flex",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
        height,
        width,
    };

    const svgStyle = {
        maxHeight: "100%",
        maxWidth: "100%",
        flex: "0 1 auto",
        height: imageHeight,
        width: imageWidth,
    };

    const barStyle = {
        transformOrigin: "0 100%",
        animation: `GDC-pump ${baseAnimationDuration / speed}s infinite`,
        fill: color,
    };

    const barStyle1 = {
        ...barStyle,
        animationDelay: `${(baseAnimationDuration / speed) * (-2 / 3)}s`,
    };

    const barStyle2 = {
        ...barStyle,
        animationDelay: `${baseAnimationDuration / speed / -3}s`,
    };

    const barStyle3 = barStyle;

    return (
        <div className="s-loading" style={wrapperStyle}>
            <svg style={svgStyle} x="0px" y="0px" viewBox="0 0 38 38">
                <style>
                    {`
                    @keyframes GDC-pump {
                        0%   {transform: scaleY(0.33)}
                        33%  {transform: scaleY(0.66)}
                        66%  {transform: scaleY(1)}
                        100% {transform: scaleY(0.33)}
                    }
                `}
                </style>
                <rect style={barStyle1} x="0" y="0" width="10" height="38" />
                <rect style={barStyle2} x="14" y="0" width="10" height="38" />
                <rect style={barStyle3} x="28" y="0" width="10" height="38" />
            </svg>
            {label ? <h3>{label}</h3> : null}
        </div>
    );
};
