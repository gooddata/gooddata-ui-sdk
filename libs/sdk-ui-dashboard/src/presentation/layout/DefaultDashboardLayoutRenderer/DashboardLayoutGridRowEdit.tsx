// (C) 2007-2023 GoodData Corporation
import React, { useMemo } from "react";
import { Col, Row } from "react-grid-system";
import reverse from "lodash/fp/reverse.js";

import { HeightResizerHotspot, useIsDraggingWidget } from "../../dragAndDrop/index.js";
import { DashboardLayoutGridRowProps } from "./DashboardLayoutGridRow.js";
import { DashboardLayoutItem } from "./DashboardLayoutItem.js";
import { IDashboardLayoutItemKeyGetter } from "./interfaces.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";

const defaultItemKeyGetter: IDashboardLayoutItemKeyGetter<unknown> = ({ item }) => item.index().toString();

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
        screen,
        items,
        renderMode,
        itemsInRowsByIndex,
    } = props;

    const isDraggingWidget = useIsDraggingWidget();
    const rowItems = useMemo(
        () =>
            items.map((item) => (
                <DashboardLayoutItem
                    key={itemKeyGetter({ item, screen })}
                    item={item}
                    itemRenderer={itemRenderer}
                    widgetRenderer={widgetRenderer}
                    screen={screen}
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
                          <Col xl={12} key={`HeightResizerHotspot-${index}`} style={{ minHeight: 0 }}>
                              <HeightResizerHotspot
                                  key={`HeightResizerHotspot-${index}`}
                                  screen={screen}
                                  getLayoutDimensions={getLayoutDimensions}
                                  section={section}
                                  items={itemsInRow}
                              />
                          </Col>,
                      );
                  }, rowItems),
        [isDraggingWidget, rowItems, itemsInRowsByIndex, screen, getLayoutDimensions, section],
    );

    return (
        <Row className="gd-fluidlayout-row s-gd-fluid-layout-row">
            {gridRowRenderer
                ? gridRowRenderer({
                      children: extendedRows,
                      screen,
                      section,
                      items,
                      renderMode,
                  })
                : extendedRows}
        </Row>
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
