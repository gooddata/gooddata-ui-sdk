// (C) 2007-2022 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import React, { useRef, useCallback } from "react";
import { Row } from "react-grid-system";
import { RenderMode } from "../../../types";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { HeightResizerHotspot } from "../../dragAndDrop";
import { DashboardLayoutItem } from "./DashboardLayoutItem";
import {
    IDashboardLayoutGridRowRenderer,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces";

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

export function DashboardLayoutGridRow<TWidget>(props: DashboardLayoutGridRowProps<TWidget>): JSX.Element {
    const rowRef = useRef<HTMLDivElement>(null);
    const {
        section,
        itemKeyGetter = ({ item }) => item.index(),
        gridRowRenderer,
        itemRenderer,
        widgetRenderer,
        getLayoutDimensions,
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

    const getContainerDimensions = useCallback(() => {
        if (!rowRef.current) {
            return undefined;
        }

        return rowRef.current.getBoundingClientRect();
    }, []);

    return (
        <div ref={rowRef}>
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
                {renderMode === "edit" && (
                    <HeightResizerHotspot
                        section={section}
                        items={items}
                        screen={screen}
                        getContainerDimensions={getContainerDimensions}
                        getLayoutDimensions={getLayoutDimensions}
                    />
                )}
            </Row>
        </div>
    );
}
