// (C) 2007-2025 GoodData Corporation

import { useCallback, useState } from "react";

import cx from "classnames";

import { DashboardEditLayoutSectionBorder } from "./DashboardEditLayoutSectionBorder.js";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";
import { IDashboardLayoutSectionRenderProps } from "../../../DefaultDashboardLayoutRenderer/index.js";

export type IDashboardEditLayoutSectionRendererOwnProps =
    IDashboardLayoutSectionRenderProps<IDashboardEditLayoutContent>;

export type IDashboardEditLayoutSectionRendererProps = IDashboardEditLayoutSectionRendererOwnProps;
export function RenderDashboardEditLayoutSectionRenderer(props: IDashboardEditLayoutSectionRendererProps) {
    const { DefaultSectionRenderer, section, children } = props;

    const { isDragging, isRowDropzoneVisible, activeHeaderRowId, rowId } = {
        isDragging: false,
        activeHeaderRowId: "active row id",
        isRowDropzoneVisible: false,
        rowId: "row id",
    };

    const [isActive, setIsActive] = useState(false);

    const markRowAsActive = useCallback(() => setIsActive(true), [setIsActive]);
    const markRowAsInactive = useCallback(() => setIsActive(false), [setIsActive]);

    const isActivatedByHeader = rowId === activeHeaderRowId;
    const isRowActive = (isActive || isActivatedByHeader) && isRowDropzoneVisible;

    const className = cx({
        active: isRowActive,
    });

    let rowBorderStatus: "muted" | "active" | "invisible" = isRowActive ? "active" : "muted";
    if (!isDragging && !isActivatedByHeader) {
        rowBorderStatus = "invisible";
    }

    const isHiddenSection = section.items().all().length === 0; //hide empty sections

    return (
        <DefaultSectionRenderer
            {...props}
            isHidden={isHiddenSection}
            className={className}
            {...(isDragging && {
                onMouseEnter: markRowAsActive,
                onMouseLeave: markRowAsInactive,
                onMouseOver: markRowAsActive,
            })}
        >
            <DashboardEditLayoutSectionBorder status={rowBorderStatus}>
                {children}
            </DashboardEditLayoutSectionBorder>
        </DefaultSectionRenderer>
    );
}

export const DashboardEditLayoutSectionRenderer = RenderDashboardEditLayoutSectionRenderer;
