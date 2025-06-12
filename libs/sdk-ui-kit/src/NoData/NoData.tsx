// (C) 2007-2020 GoodData Corporation
import React from "react";
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
export const NoData: React.FC<INoDataProps> = ({
    className,
    hasNoMatchingData,
    notFoundLabel,
    noDataLabel,
}) => {
    const classNames = cx(
        "gd-no-data",
        {
            "gd-no-matching-data": hasNoMatchingData,
            "gd-no-data-available": !hasNoMatchingData,
        },
        className,
    );

    return <div className={classNames}>{hasNoMatchingData ? notFoundLabel : noDataLabel}</div>;
};
