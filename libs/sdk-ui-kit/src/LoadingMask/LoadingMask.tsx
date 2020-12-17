// (C) 2007-2020 GoodData Corporation
import React, { useMemo, CSSProperties } from "react";
import cx from "classnames";

/**
 * @internal
 */
export interface ILoadingMaskProps {
    className?: string;
    height?: CSSProperties["height"];
    width?: CSSProperties["width"];
}

/**
 * @internal
 */
export const LoadingMask: React.FC<ILoadingMaskProps> = (props) => {
    const { className, height, width } = props;

    const style = useMemo(
        (): CSSProperties => ({
            width,
            height,
        }),
        [width, height],
    );

    return (
        <div style={style} className={cx("s-isLoading", "loading-mask", className)}>
            <div className="gd-spinner large" />
        </div>
    );
};
