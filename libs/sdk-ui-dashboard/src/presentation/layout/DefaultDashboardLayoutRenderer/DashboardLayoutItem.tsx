// (C) 2007-2020 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-backend-spi";
import { IDashboardLayoutItemRenderer, IDashboardLayoutWidgetRenderer } from "./interfaces";
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

export function DashboardLayoutItem<TWidget>(props: IDashboardLayoutItemProps<TWidget>): JSX.Element {
    const { item, itemRenderer = DashboardLayoutItemRenderer, widgetRenderer, screen } = props;
    const renderProps = { item, screen, DefaultWidgetRenderer: DashboardLayoutWidgetRenderer };

    return itemRenderer({
        ...props,
        DefaultItemRenderer: DashboardLayoutItemRenderer,
        children: widgetRenderer(renderProps),
    });
}
