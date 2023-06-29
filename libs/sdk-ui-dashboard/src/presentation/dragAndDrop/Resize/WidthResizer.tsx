// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ResizerProps } from "./types.js";

export function WidthResizer({ status }: ResizerProps) {
    const boxClassName = cx("s-gd-fluidlayout-width-resizer", "gd-fluidlayout-width-resizer", status);
    const lineClassName = cx("width-resizer-line", status);
    return (
        <div className={boxClassName}>
            <div className={lineClassName} />
        </div>
    );
}
