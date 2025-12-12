// (C) 2007-2025 GoodData Corporation

import { Fragment, type ReactNode, useRef } from "react";

import { type ScreenSize } from "@gooddata/sdk-model";

import { type IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";
import {
    type IDashboardLayoutItemFacade,
    type IDashboardLayoutSectionFacade,
} from "../../../DefaultDashboardLayoutRenderer/index.js";

export interface IDashboardEditLayoutRowRendererOwnProps {
    layoutItems: IDashboardLayoutItemFacade<IDashboardEditLayoutContent>[];
    screen: ScreenSize;
    section: IDashboardLayoutSectionFacade<IDashboardEditLayoutContent>;
    children?: ReactNode;
}

export type IDashboardEditLayoutRowRendererProps = IDashboardEditLayoutRowRendererOwnProps;

export function RenderDashboardEditLayoutRowRenderer({ children }: IDashboardEditLayoutRowRendererProps) {
    const rowId = "rowId";
    const contentRef = useRef<HTMLDivElement>(null);
    return (
        <div key={rowId} ref={contentRef} className="gd-fluid-layout-row s-gd-fluid-layout-row">
            <Fragment>{children}</Fragment>
        </div>
    );
}

export const DashboardEditLayoutRowRenderer = RenderDashboardEditLayoutRowRenderer;
