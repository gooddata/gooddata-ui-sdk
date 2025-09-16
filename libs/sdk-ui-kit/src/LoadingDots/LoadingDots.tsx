// (C) 2007-2025 GoodData Corporation

import cx from "classnames";
import range from "lodash/range.js";

/**
 * @internal
 */
export interface ILoadingDotsProps {
    className?: string;
}

const DOT_COUNT = 3; // the same as $loading-dots-count in loadingDots.scsss

/**
 * @internal
 */
export function LoadingDots({ className }: ILoadingDotsProps) {
    return (
        <div className={cx("gd-loading-dots", className)}>
            {range(1, DOT_COUNT + 1).map((index) => (
                <div key={index} className={`gd-loading-dots-${index}`} />
            ))}
        </div>
    );
}
