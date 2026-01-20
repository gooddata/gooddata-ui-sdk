// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import { DashboardLayoutItem } from "./DashboardLayoutItem.js";
import {
    type IDashboardLayoutGridRowRenderer,
    type IDashboardLayoutItemKeyGetter,
    type IDashboardLayoutItemRenderer,
    type IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import {
    type IDashboardLayoutItemFacade,
    type IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { type RenderMode } from "../../../types.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

/**
 * @alpha
 */
export interface IDashboardLayoutGridRowProps<TWidget> {
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

export function DashboardLayoutGridRow<TWidget>({
    section,
    itemKeyGetter = defaultItemKeyGetter,
    gridRowRenderer,
    itemRenderer,
    widgetRenderer,
    items,
    renderMode,
    rowIndex,
}: IDashboardLayoutGridRowProps<TWidget>): ReactElement {
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
