// (C) 2007-2022 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import React from "react";

import { IDashboardLayoutItemFacade } from "../../../DefaultDashboardLayoutRenderer";
import { IDashboardEditLayoutContent } from "./DashboardEditLayoutTypes";

export interface IDashboardEditLayoutWidgetProps {
    item: IDashboardLayoutItemFacade<IDashboardEditLayoutContent>;
    screen: ScreenSize;
    contentRef?: React.RefObject<HTMLDivElement>;
}

export const DashboardEditLayoutWidget: React.FC<IDashboardEditLayoutWidgetProps> = () => {
    return <div>Widget content MOCK</div>;
};
