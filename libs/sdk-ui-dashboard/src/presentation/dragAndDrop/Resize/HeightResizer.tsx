// (C) 2021-2022 GoodData Corporation
import React from "react";
import cx from "classnames";

export type ResizerStatus = "active" | "muted" | "error";

export interface ResizerProps {
    status: ResizerStatus;
}
export const HeightResizer: React.FC<ResizerProps> = (props) => {
    const { status } = props;
    const boxClassName = cx("s-gd-fluidlayout-height-resizer", "gd-fluidlayout-height-resizer", status);
    const lineClassName = cx("height-resizer-line", status);
    return (
        <div className={boxClassName}>
            <div className={lineClassName} />
        </div>
    );
};
