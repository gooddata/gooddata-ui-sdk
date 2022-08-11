// (C) 2007-2022 GoodData Corporation
import React, { useMemo, CSSProperties } from "react";
import cx from "classnames";

/**
 * @internal
 */
export type SpinnerSize = "large" | "small";

/**
 * @internal
 */
export interface ILoadingMaskProps {
    className?: string;
    height?: CSSProperties["height"];
    width?: CSSProperties["width"];
    size?: SpinnerSize;
}

/**
 * @internal
 */
export const LoadingMask: React.FC<ILoadingMaskProps> = (props) => {
    const { className, height, width, size } = props;

    const style = useMemo(
        (): CSSProperties => ({
            width,
            height,
        }),
        [width, height],
    );

    const spinnerSize: SpinnerSize = size ? size : "large";
    return (
        <div style={style} aria-label="loading" className={cx("s-isLoading", "loading-mask", className)}>
            <div className={cx("gd-spinner", spinnerSize)} />
        </div>
    );
};
