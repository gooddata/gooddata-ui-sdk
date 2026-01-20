// (C) 2021-2026 GoodData Corporation

import cx from "classnames";

import { type IResizerProps } from "./types.js";

export function HeightResizer({ status }: IResizerProps) {
    const boxClassName = cx("gd-fluidlayout-height-resizer", status, "s-gd-fluidlayout-height-resizer");
    const handlerClassName = cx("width-resizer-drag-handler", status);
    const lineClassName = cx("height-resizer-line", status);

    const showDragHandler = status === "active";

    return (
        <div className={boxClassName}>
            <div className={lineClassName} />
            {showDragHandler ? (
                <>
                    <div className={handlerClassName} />
                    <div className={lineClassName} />
                </>
            ) : null}
        </div>
    );
}
