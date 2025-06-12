// (C) 2022 GoodData Corporation
import cx from "classnames";
import React from "react";

/**
 * @internal
 */
export interface IColorPreviewProps {
    colors: string[];
    className?: string;
}

/**
 * @internal
 */
export const ColorPreview = (props: IColorPreviewProps) => {
    return (
        <div className={cx("gd-color-preview", props.className)}>
            {props.colors.map((color, index) => (
                <div
                    key={index}
                    className="gd-color-preview-element"
                    style={{ backgroundColor: color }}
                ></div>
            ))}
        </div>
    );
};
