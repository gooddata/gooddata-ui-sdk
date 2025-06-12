// (C) 2007-2025 GoodData Corporation
import React, { useMemo } from "react";
import reverse from "lodash/fp/reverse.js";

import { DashboardLayoutGridRowProps } from "./DashboardLayoutGridRow.js";
import { DashboardLayoutItem } from "./DashboardLayoutItem.js";
import { IDashboardLayoutItemKeyGetter } from "./interfaces.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { HeightResizerHotspot } from "../dragAndDrop/Resize/HeightResizerHotspot.js";
import { useIsDraggingWidget } from "../../dragAndDrop/draggableWidget/useIsDraggingWidget.js";
import { ExtendedDashboardWidget } from "../../../model/index.js";

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
            itemsInRowsByIndex.flatMap(([, itemsInRow], rowIndex) =>
                itemsInRow.map((item) => (
                    <DashboardLayoutItem
                        key={itemKeyGetter({ item, screen })}
                        item={item}
                        renderMode={renderMode}
                        itemRenderer={itemRenderer}
                        widgetRenderer={widgetRenderer}
                        rowIndex={rowIndex}
                    />
                )),
            ),
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
                              // TWidget to ExtendedDashboardWidget (originally unknown)
                              section={section as IDashboardLayoutSectionFacade<ExtendedDashboardWidget>}
                              items={itemsInRow as IDashboardLayoutItemFacade<ExtendedDashboardWidget>[]}
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
