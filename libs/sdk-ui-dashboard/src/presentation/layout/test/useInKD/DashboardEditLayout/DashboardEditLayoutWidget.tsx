// (C) 2007-2025 GoodData Corporation
import React from "react";

import { ScreenSize } from "@gooddata/sdk-model";

import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";
import { IDashboardLayoutItemFacade } from "../../../DefaultDashboardLayoutRenderer/index.js";

export interface IDashboardEditLayoutWidgetProps {
    item: IDashboardLayoutItemFacade<IDashboardEditLayoutContent>;
    screen: ScreenSize;
    contentRef?: React.RefObject<HTMLDivElement>;
}

export function DashboardEditLayoutWidget(_props: IDashboardEditLayoutWidgetProps) {
    return <div>Widget content MOCK</div>;
}
