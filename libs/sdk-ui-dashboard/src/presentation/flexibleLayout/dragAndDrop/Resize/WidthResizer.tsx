// (C) 2019-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ResizerProps } from "./types.js";

export function WidthResizer({ status }: ResizerProps) {
    const boxClassName = cx("gd-fluidlayout-width-resizer", status, "s-gd-fluidlayout-width-resizer");
    const lineClassName = cx("width-resizer-line", status);
    return (
        <div className={boxClassName}>
            <div className={lineClassName} />
        </div>
    );
}
