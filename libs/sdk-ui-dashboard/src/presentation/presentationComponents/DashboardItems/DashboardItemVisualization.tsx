// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardItemBase, IDashboardItemBaseProps } from "./DashboardItemBase.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    useDashboardSelector,
} from "../../../model/index.js";

export const DashboardItemVisualization: React.FC<IDashboardItemBaseProps> = ({
    visualizationClassName,
    ...props
}) => {
    const isExport = useDashboardSelector(selectIsExport);
    const isSnapshotAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);
    const ariaHidden = isSnapshotAccessibilityEnabled && isExport ? true : undefined;

    return (
        <DashboardItemBase
            {...props}
            ariaHidden={ariaHidden}
            visualizationClassName={cx("visualization", visualizationClassName)}
        />
    );
};
