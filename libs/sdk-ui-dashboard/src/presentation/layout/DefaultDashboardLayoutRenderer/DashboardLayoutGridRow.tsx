// (C) 2007-2023 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import React from "react";
import { Row } from "react-grid-system";
import { RenderMode } from "../../../types.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";
import { DashboardLayoutItem } from "./DashboardLayoutItem.js";
import {
    IDashboardLayoutGridRowRenderer,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";

/**
 * @alpha
 */
export interface DashboardLayoutGridRowProps<TWidget> {
    screen: ScreenSize;
    section: IDashboardLayoutSectionFacade<TWidget>;
    itemKeyGetter?: IDashboardLayoutItemKeyGetter<TWidget>;
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;
    widgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;
    gridRowRenderer?: IDashboardLayoutGridRowRenderer<TWidget>;
    getLayoutDimensions: () => DOMRect;
    items: IDashboardLayoutItemFacade<TWidget>[];
    renderMode: RenderMode;
}

const defaultItemKeyGetter: IDashboardLayoutItemKeyGetter<unknown> = ({ item }) => item.index().toString();

export function DashboardLayoutGridRow<TWidget>(props: DashboardLayoutGridRowProps<TWidget>): JSX.Element {
    const {
        section,
        itemKeyGetter = defaultItemKeyGetter,
        gridRowRenderer,
        itemRenderer,
        widgetRenderer,
        screen,
        items,
        renderMode,
    } = props;

    const rowItems = items.map((item) => (
        <DashboardLayoutItem
            key={itemKeyGetter({ item, screen })}
            item={item}
            itemRenderer={itemRenderer}
            widgetRenderer={widgetRenderer}
            screen={screen}
        />
    ));

    return (
        <Row className="gd-fluidlayout-row s-gd-fluid-layout-row">
            {gridRowRenderer
                ? gridRowRenderer({
                      children: rowItems,
                      screen,
                      section,
                      items,
                      renderMode,
                  })
                : rowItems}
        </Row>
    );
}
