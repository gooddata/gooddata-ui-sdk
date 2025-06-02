// (C) 2021-2025 GoodData Corporation
import React from "react";

import { TitleWrapper } from "./TitleWrapper.js";
import { CustomTitleComponent } from "./types.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    useDashboardSelector,
} from "../../../model/index.js";
import { Typography } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export const DefaultTitle: CustomTitleComponent = (props) => {
    const { title } = props;
    const snapshotExportAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);
    const isExport = useDashboardSelector(selectIsExport);

    return (
        <TitleWrapper>
            {isExport && snapshotExportAccessibilityEnabled ? (
                <Typography tagName="h1" className={"s-gd-dashboard-title s-dash-title dash-title static"}>
                    {title}
                </Typography>
            ) : (
                <div className={"s-gd-dashboard-title s-dash-title dash-title static"}>{title}</div>
            )}
        </TitleWrapper>
    );
};
