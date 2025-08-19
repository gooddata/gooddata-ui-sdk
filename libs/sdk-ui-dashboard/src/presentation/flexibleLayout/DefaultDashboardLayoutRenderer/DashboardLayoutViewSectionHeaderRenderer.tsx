// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";

import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";
import { Typography } from "@gooddata/sdk-ui-kit";

import { DashboardLayoutSectionHeaderDescription } from "./DashboardLayoutSectionHeaderDescription.js";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { getLayoutConfiguration } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import {
    selectEnableSnapshotExportAccessibility,
    selectIsExport,
    useDashboardSelector,
} from "../../../model/index.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";
import { HeaderExportData } from "../../export/index.js";

export interface IDashboardLayoutSectionHeaderProps {
    section: IDashboardLayoutSectionFacade<unknown>;
    exportData?: HeaderExportData;
    onLoadingChanged?: OnLoadingChanged;
    onError?: OnError;
}

export const DashboardLayoutViewSectionHeader: React.FC<IDashboardLayoutSectionHeaderProps> = ({
    section,
    exportData,
    onLoadingChanged,
    onError,
}) => {
    const { sections } = getLayoutConfiguration(section.layout().raw());
    const { LoadingComponent } = useDashboardComponentsContext();
    const isExport = useDashboardSelector(selectIsExport);
    const isSnapshotAccessibilityEnabled = useDashboardSelector(selectEnableSnapshotExportAccessibility);
    const useAccessibilityExportClasses = isSnapshotAccessibilityEnabled && isExport;

    const title = section.title();
    const description = section.description();
    if (!sections.areHeadersEnabled || (isEmpty(title) && isEmpty(description))) {
        return null;
    }
    const isNestedLayout = section.layout().path() !== undefined;
    return (
        <div
            className={cx("gd-fluid-layout-row-header s-fluid-layout-row-header", {
                "gd-row-header-export": useAccessibilityExportClasses,
            })}
            {...exportData?.info}
        >
            <div className={"gd-fluid-layout-row-header-container"}>
                <div className="gd-row-header-view">
                    {title ? (
                        <div
                            className={cx("gd-row-header-title-wrapper", {
                                "gd-row-header-title-wrapper-export": useAccessibilityExportClasses,
                            })}
                            {...exportData?.title}
                        >
                            <span className="title">
                                <Typography
                                    tagName={isNestedLayout ? "h3" : "h2"}
                                    className="s-fluid-layout-row-title"
                                >
                                    {title}
                                </Typography>
                            </span>
                        </div>
                    ) : null}
                    {description ? (
                        <DashboardLayoutSectionHeaderDescription
                            description={description}
                            exportData={exportData?.description}
                            LoadingComponent={LoadingComponent}
                            onLoadingChanged={onLoadingChanged}
                            onError={onError}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};
