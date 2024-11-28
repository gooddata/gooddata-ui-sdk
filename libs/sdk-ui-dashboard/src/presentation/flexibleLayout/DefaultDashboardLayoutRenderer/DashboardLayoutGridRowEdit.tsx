// (C) 2007-2024 GoodData Corporation
import React, { useMemo } from "react";
import reverse from "lodash/fp/reverse.js";

import { DashboardLayoutGridRowProps } from "./DashboardLayoutGridRow.js";
import { DashboardLayoutItem } from "./DashboardLayoutItem.js";
import { IDashboardLayoutItemKeyGetter } from "./interfaces.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { HeightResizerHotspot } from "../dragAndDrop/Resize/HeightResizerHotspot.js";
import { useIsDraggingWidget } from "../../dragAndDrop/draggableWidget/useIsDraggingWidget.js";

const defaultItemKeyGetter: IDashboardLayoutItemKeyGetter<unknown> = ({ item }) =>
    serializeLayoutItemPath(item.index());

export function DashboardLayoutGridRowEdit<TWidget>(
    props: DashboardLayoutGridRowProps<TWidget> & {
        itemsInRowsByIndex: [number, IDashboardLayoutItemFacade<TWidget>[]][];
    },
): JSX.Element {
    const {
        section,
        itemKeyGetter = defaultItemKeyGetter,
        gridRowRenderer,
        itemRenderer,
        widgetRenderer,
        getLayoutDimensions,
        items,
        renderMode,
        itemsInRowsByIndex,
    } = props;
    const screen = useScreenSize();

    const isDraggingWidget = useIsDraggingWidget();
    const rowItems = useMemo(
        () =>
            items.map((item) => (
                <DashboardLayoutItem
                    key={itemKeyGetter({ item, screen })}
                    item={item}
                    itemRenderer={itemRenderer}
                    widgetRenderer={widgetRenderer}
                />
            )),
        [itemKeyGetter, itemRenderer, items, screen, widgetRenderer],
    );

    const extendedRows = useMemo(
        () =>
            isDraggingWidget
                ? rowItems
                : reverse(itemsInRowsByIndex).reduce((acc, [index, itemsInRow]) => {
                      return splice(
                          acc,
                          index + 1,
                          0,
                          <HeightResizerHotspot
                              key={`HeightResizerHotspot-${index}`}
                              getLayoutDimensions={getLayoutDimensions}
                              section={section}
                              items={itemsInRow}
                          />,
                      );
                  }, rowItems),
        [isDraggingWidget, rowItems, itemsInRowsByIndex, getLayoutDimensions, section],
    );

    return (
        <>
            {gridRowRenderer
                ? gridRowRenderer({
                      children: extendedRows,
                      section,
                      items,
                      renderMode,
                  })
                : extendedRows}
        </>
    );
}

function splice(arr: any[], start: number, deleteCount: number, ...addItem: any[]) {
    const result = [];
    if (start > 0) {
        result.push(...arr.slice(0, start));
    }
    result.push(...addItem);
    const len = result.length - addItem.length;
    const count = deleteCount <= 0 ? len : len + deleteCount;
    if (arr[count]) {
        result.push(...arr.slice(count));
    }
    return result;
}
