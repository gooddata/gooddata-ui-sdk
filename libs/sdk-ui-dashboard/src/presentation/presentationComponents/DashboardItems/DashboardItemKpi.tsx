// (C) 2020-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { DashboardItemBase, IDashboardItemBaseProps } from "./DashboardItemBase.js";

export const DashboardItemKpi: React.FC<IDashboardItemBaseProps> = ({ visualizationClassName, ...props }) => {
    return <DashboardItemBase {...props} visualizationClassName={cx("kpi", visualizationClassName)} />;
};
