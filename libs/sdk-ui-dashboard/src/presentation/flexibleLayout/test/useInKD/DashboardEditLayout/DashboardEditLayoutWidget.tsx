// (C) 2007-2025 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import { RefObject } from "react";

import { IDashboardLayoutItemFacade } from "../../../DefaultDashboardLayoutRenderer/index.js";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";

export interface IDashboardEditLayoutWidgetProps {
    item: IDashboardLayoutItemFacade<IDashboardEditLayoutContent>;
    screen: ScreenSize;
    contentRef?: RefObject<HTMLDivElement>;
}

export function DashboardEditLayoutWidget(_props: IDashboardEditLayoutWidgetProps) {
    return <div>Widget content MOCK</div>;
}
