// (C) 2019-2025 GoodData Corporation

import { DashboardLayoutEditSectionHeader } from "../../../DefaultDashboardLayoutRenderer/index.js";

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
