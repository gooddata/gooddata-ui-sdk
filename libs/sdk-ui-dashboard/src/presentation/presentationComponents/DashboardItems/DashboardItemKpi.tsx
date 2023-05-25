// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";

import { IDashboardItemBaseProps, DashboardItemBase } from "./DashboardItemBase.js";

export const DashboardItemKpi: React.FC<IDashboardItemBaseProps> = ({ visualizationClassName, ...props }) => {
    return <DashboardItemBase {...props} visualizationClassName={cx("kpi", visualizationClassName)} />;
};
