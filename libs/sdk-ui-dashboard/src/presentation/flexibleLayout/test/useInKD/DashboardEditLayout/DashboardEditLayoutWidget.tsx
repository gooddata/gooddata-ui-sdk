// (C) 2007-2026 GoodData Corporation

import { type RefObject } from "react";

import { type ScreenSize } from "@gooddata/sdk-model";

import { type IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes.js";
import { type IDashboardLayoutItemFacade } from "../../../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";

export interface IDashboardEditLayoutWidgetProps {
    item: IDashboardLayoutItemFacade<IDashboardEditLayoutContent>;
    screen: ScreenSize;
    contentRef?: RefObject<HTMLDivElement | null>;
}

export function DashboardEditLayoutWidget(_props: IDashboardEditLayoutWidgetProps) {
    return <div>Widget content MOCK</div>;
}
