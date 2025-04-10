// (C) 2019-2025 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { OnError, OnLoadingChanged } from "@gooddata/sdk-ui";

import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { useLayoutSectionsConfiguration } from "../../widget/common/useLayoutSectionsConfiguration.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/index.js";

import { DashboardLayoutSectionHeaderDescription } from "./DashboardLayoutSectionHeaderDescription.js";
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
    const { areSectionHeadersEnabled } = useLayoutSectionsConfiguration(section.layout().raw());
    const { LoadingComponent } = useDashboardComponentsContext();

    const title = section.title();
    const description = section.description();
    if (!areSectionHeadersEnabled || (isEmpty(title) && isEmpty(description))) {
        return null;
    }
    const isNestedLayout = section.layout().path() !== undefined;
    return (
        <div className="gd-fluid-layout-row-header s-fluid-layout-row-header" {...exportData?.info}>
            <div className={"gd-fluid-layout-row-header-container"}>
                <div className="gd-row-header-view">
                    {title ? (
                        <div className="gd-row-header-title-wrapper" {...exportData?.title}>
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
