// (C) 2020-2025 GoodData Corporation
import cx from "classnames";

import { IDashboardItemBaseProps, DashboardItemBase } from "./DashboardItemBase.js";

export function DashboardItemKpi({ visualizationClassName, ...props }: IDashboardItemBaseProps) {
    return <DashboardItemBase {...props} visualizationClassName={cx("kpi", visualizationClassName)} />;
}
