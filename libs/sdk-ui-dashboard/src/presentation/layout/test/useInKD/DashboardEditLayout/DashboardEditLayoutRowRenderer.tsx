// (C) 2007-2025 GoodData Corporation
import { Fragment, ReactNode, useRef } from "react";

import { ScreenSize } from "@gooddata/sdk-model";

import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../DefaultDashboardLayoutRenderer/index.js";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";

export interface IDashboardEditLayoutRowRendererOwnProps {
    layoutItems: IDashboardLayoutItemFacade<IDashboardEditLayoutContent>[];
    screen: ScreenSize;
    section: IDashboardLayoutSectionFacade<IDashboardEditLayoutContent>;
    children?: ReactNode;
}

export type IDashboardEditLayoutRowRendererProps = IDashboardEditLayoutRowRendererOwnProps;

export function RenderDashboardEditLayoutRowRenderer(props: IDashboardEditLayoutRowRendererProps) {
    const { children } = props;
    const rowId = "rowId";
    const contentRef = useRef<HTMLDivElement>(null);
    return (
        <div key={rowId} ref={contentRef} className="gd-fluid-layout-row s-gd-fluid-layout-row">
            <Fragment>{children}</Fragment>
        </div>
    );
}

export const DashboardEditLayoutRowRenderer = RenderDashboardEditLayoutRowRenderer;
