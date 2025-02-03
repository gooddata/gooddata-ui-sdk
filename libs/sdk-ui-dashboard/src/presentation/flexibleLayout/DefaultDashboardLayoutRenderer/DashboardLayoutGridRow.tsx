// (C) 2007-2025 GoodData Corporation
import React from "react";

import { RenderMode } from "../../../types.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";

import { DashboardLayoutItem } from "./DashboardLayoutItem.js";
import {
    IDashboardLayoutGridRowRenderer,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import { serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

/**
 * @alpha
 */
export interface DashboardLayoutGridRowProps<TWidget> {
    section: IDashboardLayoutSectionFacade<TWidget>;
    itemKeyGetter?: IDashboardLayoutItemKeyGetter<TWidget>;
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;
    widgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;
    gridRowRenderer?: IDashboardLayoutGridRowRenderer<TWidget>;
    getLayoutDimensions: () => DOMRect;
    items: IDashboardLayoutItemFacade<TWidget>[];
    renderMode: RenderMode;
    rowIndex: number;
}

const defaultItemKeyGetter: IDashboardLayoutItemKeyGetter<unknown> = ({ item }) =>
    serializeLayoutItemPath(item.index());

export function DashboardLayoutGridRow<TWidget>(props: DashboardLayoutGridRowProps<TWidget>): JSX.Element {
    const {
        section,
        itemKeyGetter = defaultItemKeyGetter,
        gridRowRenderer,
        itemRenderer,
        widgetRenderer,
        items,
        renderMode,
        rowIndex,
    } = props;
    const screen = useScreenSize();

    const rowItems = items.map((item) => (
        <DashboardLayoutItem
            renderMode={renderMode}
            key={itemKeyGetter({ item, screen })}
            item={item}
            itemRenderer={itemRenderer}
            widgetRenderer={widgetRenderer}
            rowIndex={rowIndex}
        />
    ));

    return (
        <>
            {gridRowRenderer
                ? gridRowRenderer({
                      children: rowItems,
                      section,
                      items,
                      renderMode,
                  })
                : rowItems}
        </>
    );
}
