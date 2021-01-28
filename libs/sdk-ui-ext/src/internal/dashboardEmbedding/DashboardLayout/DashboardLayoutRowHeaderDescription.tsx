// (C) 2019-2020 GoodData Corporation
import * as React from "react";
import cx from "classnames";

/**
 * @alpha
 */
export interface IDashboardLayoutRowHeaderDescriptionProps {
    description: string;
}

export const DashboardLayoutRowHeaderDescription: React.FC<IDashboardLayoutRowHeaderDescriptionProps> = (
    props,
) => {
    const { description } = props;

    const className = cx("gd-paragraph", "description", "s-fluid-layout-row-description");
    return <div className={className}>{description}</div>;
};
