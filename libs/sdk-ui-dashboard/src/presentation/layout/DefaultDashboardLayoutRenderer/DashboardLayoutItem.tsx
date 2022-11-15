// (C) 2007-2022 GoodData Corporation

import React from "react";
import { ScreenSize } from "@gooddata/sdk-model";
import {
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
    IDashboardLayoutWidgetRenderProps,
} from "./interfaces";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer";
import { DashboardLayoutWidgetRenderer } from "./DashboardLayoutWidgetRenderer";

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

export function DashboardLayoutItem<TWidget>(props: IDashboardLayoutItemProps<TWidget>): JSX.Element {
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
