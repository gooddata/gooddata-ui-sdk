// (C) 2007-2019 GoodData Corporation

import React from "react";
import PropTypes from "prop-types";

import "@gooddata/react-components/styles/css/main.css";

const baseAnimationDuration = 1.8;

export const CustomLoading = ({ label, inline, height, width, imageHeight, imageWidth, color, speed }) => {
    const wrapperStyle = {
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
            <svg alt="loading…" style={svgStyle} x="0px" y="0px" viewBox="0 0 38 38">
                <style scoped>
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
CustomLoading.propTypes = {
    color: PropTypes.string,
    speed: PropTypes.number,
    inline: PropTypes.bool,
    height: PropTypes.any,
    width: PropTypes.any,
    imageHeight: PropTypes.any,
    imageWidth: PropTypes.any,
    label: PropTypes.string,
};
CustomLoading.defaultProps = {
    color: "#14b2e2",
    speed: 1,
    inline: false,
    height: "100%",
    width: undefined,
    imageHeight: 38,
    imageWidth: undefined,
    label: null,
};

export default CustomLoading;
