// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { DashboardItemBase, type IDashboardItemBaseProps } from "./DashboardItemBase.js";

export function DashboardItemVisualization({ visualizationClassName, ...props }: IDashboardItemBaseProps) {
    return (
        <DashboardItemBase {...props} visualizationClassName={cx("visualization", visualizationClassName)} />
    );
}
