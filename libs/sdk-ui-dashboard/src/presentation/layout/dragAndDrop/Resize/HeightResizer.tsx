// (C) 2021-2025 GoodData Corporation
import cx from "classnames";
import { ResizerProps } from "./types.js";

export function HeightResizer({ status }: ResizerProps) {
    const boxClassName = cx("s-gd-fluidlayout-height-resizer", "gd-fluidlayout-height-resizer", status);
    const lineClassName = cx("height-resizer-line", status);
    return (
        <div className={boxClassName}>
            <div className={lineClassName} />
        </div>
    );
}
