// (C) 2019-2025 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import isEmpty from "lodash/isEmpty.js";

import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { useLayoutSectionsConfiguration } from "../../widget/common/useLayoutSectionsConfiguration.js";

import { DashboardLayoutSectionHeaderDescription } from "./DashboardLayoutSectionHeaderDescription.js";
import { HeaderExportData } from "../../export/index.js";

export interface IDashboardLayoutSectionHeaderProps {
    section: IDashboardLayoutSectionFacade<unknown>;
    exportData?: HeaderExportData;
}

export const DashboardLayoutViewSectionHeader: React.FC<IDashboardLayoutSectionHeaderProps> = ({
    section,
    exportData,
}) => {
    const { areSectionHeadersEnabled } = useLayoutSectionsConfiguration(section.layout().raw());
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
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};
