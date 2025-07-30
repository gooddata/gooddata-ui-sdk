// (C) 2007-2025 GoodData Corporation

import React, { ReactElement } from "react";
import { ScreenSize } from "@gooddata/sdk-model";
import {
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
    IDashboardLayoutWidgetRenderProps,
} from "./interfaces.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/legacyFluidLayout/facade/interfaces.js";
import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer.js";
import { DashboardLayoutWidgetRenderer } from "./DashboardLayoutWidgetRenderer.js";

/**
 * @alpha
 */
export interface IDashboardLayoutItemProps<TWidget> {
    item: IDashboardLayoutItemFacade<TWidget>;
    screen: ScreenSize;
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;
    widgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;
}

const defaultItemRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => (
    <DashboardLayoutItemRenderer {...props} />
);

export function DashboardLayoutItem<TWidget>(props: IDashboardLayoutItemProps<TWidget>): ReactElement {
    const { item, itemRenderer = defaultItemRenderer, widgetRenderer, screen } = props;

    const renderProps = {
        item,
        screen,
        DefaultWidgetRenderer: DashboardLayoutWidgetRenderer,
    } as IDashboardLayoutWidgetRenderProps<TWidget>;

    return itemRenderer({
        ...props,
        DefaultItemRenderer: DashboardLayoutItemRenderer,
        children: widgetRenderer(renderProps),
    });
}
