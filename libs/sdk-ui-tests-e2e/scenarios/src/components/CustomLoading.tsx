import React from "react";
import cx from "classnames";

import styles from "./CustomLoading.module.scss";

const baseAnimationDuration = 1.8;

export interface ICustomLoadingProps {
    label?: string;
    inline?: boolean;
    height?: string;
    width?: string;
    imageHeight?: string;
    imageWidth?: string;
    color?: string;
    speed?: number;
    className?: string;
}

export const CustomLoading: React.FC<ICustomLoadingProps> = ({
    label = null,
    inline = false,
    height = "100%",
    width = undefined,
    imageHeight = "38px",
    imageWidth = undefined,
    color = "#14b2e2",
    speed = 1,
    className = null,
}) => {
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

    return (
        <div
            className={cx(styles.CustomLoading, "s-loading", inline && styles.Inline, className)}
            style={{
                width,
                height,
            }}
        >
            <svg
                className={styles.SVG}
                style={{
                    width: imageWidth,
                    height: imageHeight,
                }}
                x="0px"
                y="0px"
                viewBox="0 0 38 38"
            >
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
                <rect style={barStyle} x="28" y="0" width="10" height="38" />
            </svg>
            {label ? <h3>{label}</h3> : null}
        </div>
    );
};

export default CustomLoading;
