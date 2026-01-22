// (C) 2019-2026 GoodData Corporation

import { DashboardLayoutEditSectionHeader } from "../../../DefaultDashboardLayoutRenderer/DashboardLayoutEditSectionHeader.js";

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
        <DashboardLayoutEditSectionHeader
            // @ts-expect-error this is weird, who did this?
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
