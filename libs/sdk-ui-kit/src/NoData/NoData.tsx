// (C) 2007-2025 GoodData Corporation

import cx from "classnames";

/**
 * @internal
 */
export interface INoDataProps {
    className?: string;
    noDataLabel: string;
    notFoundLabel?: string;
    hasNoMatchingData?: boolean;
}

/**
 * @internal
 */
export function NoData({ className, hasNoMatchingData, notFoundLabel, noDataLabel }: INoDataProps) {
    const classNames = cx(
        "gd-no-data",
        {
            "gd-no-matching-data": hasNoMatchingData,
            "gd-no-data-available": !hasNoMatchingData,
        },
        className,
    );

    return <div className={classNames}>{hasNoMatchingData ? notFoundLabel : noDataLabel}</div>;
}
