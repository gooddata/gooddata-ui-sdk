// (C) 2019-2025 GoodData Corporation
import cx from "classnames";
import { ResizerProps } from "./types.js";

export function WidthResizer({ status }: ResizerProps) {
    const boxClassName = cx("gd-fluidlayout-width-resizer", status, "s-gd-fluidlayout-width-resizer");
    const lineClassName = cx("width-resizer-line", status);
    const handlerClassName = cx("width-resizer-drag-handler", status);

    const showDragHandler = status === "active";

    return (
        <div className="gd-fluidlayout-width-resizer__container">
            <div className={boxClassName}>
                <div className={lineClassName} />
                {showDragHandler ? (
                    <>
                        <div className={handlerClassName} />
                        <div className={lineClassName} />
                    </>
                ) : null}
            </div>
        </div>
    );
}
