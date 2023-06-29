// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardItemBase, IDashboardItemBaseProps } from "./DashboardItemBase.js";

export const DashboardItemVisualization: React.FC<IDashboardItemBaseProps> = ({
    visualizationClassName,
    ...props
}) => {
    return (
        <DashboardItemBase {...props} visualizationClassName={cx("visualization", visualizationClassName)} />
    );
};
