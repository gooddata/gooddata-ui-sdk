// (C) 2007-2025 GoodData Corporation
import { useMemo, CSSProperties } from "react";
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
export function LoadingMask({ className, height, width, size }: ILoadingMaskProps) {
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
}
