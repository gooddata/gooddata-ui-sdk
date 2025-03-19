// (C) 2019-2024 GoodData Corporation
import * as React from "react";

import { DashboardLayoutEditSectionHeader } from "../../../DefaultDashboardLayoutRenderer/index.js";

export interface IDashboardEditLayoutSectionHeaderOwnProps {
    title: string;
    description: string;
    rowId: string;
}

export type IDashboardEditLayoutSectionHeaderProps = IDashboardEditLayoutSectionHeaderOwnProps;

export const RenderDashboardEditLayoutSectionHeader: React.FC<IDashboardEditLayoutSectionHeaderProps> = (
    props,
) => {
    const { description, title } = props;

    const isDashboardEditing = true;

    return (
        <DashboardLayoutEditSectionHeader
            title={title}
            description={description}
            renderHeader={
                isDashboardEditing
                    ? "<SectionHeaderEditable title={title} description={description} rowId={rowId} />"
                    : null
            }
        />
    );
};

export const DashboardEditLayoutSectionHeader = RenderDashboardEditLayoutSectionHeader;
