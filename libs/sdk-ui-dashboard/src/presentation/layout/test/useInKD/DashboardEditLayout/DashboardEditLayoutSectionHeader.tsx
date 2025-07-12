// (C) 2019-2025 GoodData Corporation

import { DashboardLayoutSectionHeader } from "../../../DefaultDashboardLayoutRenderer/index.js";

export interface IDashboardEditLayoutSectionHeaderOwnProps {
    title: string;
    description: string;
    rowId: string;
}

export type IDashboardEditLayoutSectionHeaderProps = IDashboardEditLayoutSectionHeaderOwnProps;

export function RenderDashboardEditLayoutSectionHeader({
    description,
    title,
}: IDashboardEditLayoutSectionHeaderProps) {
    const isDashboardEditing = true;

    return (
        <DashboardLayoutSectionHeader
            title={title}
            description={description}
            renderHeader={
                isDashboardEditing
                    ? "<SectionHeaderEditable title={title} description={description} rowId={rowId} />"
                    : null
            }
        />
    );
}

export const DashboardEditLayoutSectionHeader = RenderDashboardEditLayoutSectionHeader;
