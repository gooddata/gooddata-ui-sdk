// (C) 2020-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { DashboardItemBase, IDashboardItemBaseProps } from "./DashboardItemBase.js";

export function DashboardItemKpi({ visualizationClassName, ...props }: IDashboardItemBaseProps) {
    return <DashboardItemBase {...props} visualizationClassName={cx("kpi", visualizationClassName)} />;
}
