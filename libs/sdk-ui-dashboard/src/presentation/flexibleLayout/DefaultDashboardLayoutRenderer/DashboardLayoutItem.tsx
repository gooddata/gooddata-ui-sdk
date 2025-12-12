// (C) 2007-2025 GoodData Corporation

import { type ReactElement } from "react";

import { DashboardLayoutItemRenderer } from "./DashboardLayoutItemRenderer.js";
import { DashboardLayoutWidgetRenderer } from "./DashboardLayoutWidgetRenderer.js";
import {
    type IDashboardLayoutItemRenderer,
    type IDashboardLayoutWidgetRenderProps,
    type IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import { type IDashboardLayoutItemFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { type RenderMode } from "../../../types.js";

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
