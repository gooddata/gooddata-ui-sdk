// (C) 2007-2026 GoodData Corporation

import cx from "classnames";

import { _range } from "@gooddata/util";

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
            {_range(1, DOT_COUNT + 1).map((index) => (
                <div key={index} className={`gd-loading-dots-${index}`} />
            ))}
        </div>
    );
}
