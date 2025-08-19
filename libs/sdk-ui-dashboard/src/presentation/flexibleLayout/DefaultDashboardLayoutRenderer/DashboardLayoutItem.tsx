// (C) 2007-2025 GoodData Corporation

import React, { ReactElement } from "react";

import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer.js";
import { DashboardLayoutWidgetRenderer } from "./DashboardLayoutWidgetRenderer.js";
import {
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderProps,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { RenderMode } from "../../../types.js";

/**
 * @alpha
 */
export interface IDashboardLayoutItemProps<TWidget> {
    item: IDashboardLayoutItemFacade<TWidget>;
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;
    widgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;
    rowIndex: number;
    renderMode: RenderMode;
}

const defaultItemRenderer: IDashboardLayoutItemRenderer<unknown> = (props) => (
    <DashboardLayoutItemRenderer {...props} />
);

export function DashboardLayoutItem<TWidget>(props: IDashboardLayoutItemProps<TWidget>): ReactElement {
    const { item, itemRenderer = defaultItemRenderer, widgetRenderer, rowIndex } = props;

    const renderProps = {
        item,
        DefaultWidgetRenderer: DashboardLayoutWidgetRenderer,
        rowIndex,
    } as IDashboardLayoutWidgetRenderProps<TWidget>;

    return itemRenderer({
        ...props,
        DefaultItemRenderer: DashboardLayoutItemRenderer,
        children: widgetRenderer(renderProps),
    });
}
