// (C) 2007-2020 GoodData Corporation
import React from "react";
import flatMap from "lodash/flatMap";
import { ScreenSize } from "@gooddata/sdk-backend-spi";
import {
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutWidgetRenderer,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutSectionHeaderRenderer,
    IDashboardLayoutGridRowRenderer,
} from "./interfaces";
import { DashboardLayoutItem } from "./DashboardLayoutItem";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer";

/**
 * @alpha
 */
export interface IDashboardLayoutSectionProps<TWidget> {
    section: IDashboardLayoutSectionFacade<TWidget>;
    sectionKeyGetter?: IDashboardLayoutSectionKeyGetter<TWidget>;
    sectionRenderer?: IDashboardLayoutSectionRenderer<TWidget>;
    sectionHeaderRenderer?: IDashboardLayoutSectionHeaderRenderer<TWidget>;
    itemKeyGetter?: IDashboardLayoutItemKeyGetter<TWidget>;
    itemRenderer?: IDashboardLayoutItemRenderer<TWidget>;
    widgetRenderer: IDashboardLayoutWidgetRenderer<TWidget>;
    gridRowRenderer?: IDashboardLayoutGridRowRenderer<TWidget>;
    screen: ScreenSize;
}

export function DashboardLayoutSection<TWidget>(props: IDashboardLayoutSectionProps<TWidget>): JSX.Element {
    const {
        section,
        sectionRenderer = DashboardLayoutSectionRenderer,
        sectionHeaderRenderer = DashboardLayoutSectionHeaderRenderer,
        itemKeyGetter = ({ item }) => item.index(),
        gridRowRenderer = ({ children }) => children,
        itemRenderer,
        widgetRenderer,
        screen,
    } = props;
    const renderProps = { section, screen };

    const items = flatMap(section.items().asGridRows(screen), (itemsInRow) => {
        const rowItems = itemsInRow.map((item) => (
            <DashboardLayoutItem
                key={itemKeyGetter({ item, screen })}
                item={item}
                itemRenderer={itemRenderer}
                widgetRenderer={widgetRenderer}
                screen={screen}
            />
        ));
        return gridRowRenderer
            ? gridRowRenderer({ children: rowItems, screen, section, items: itemsInRow })
            : rowItems;
    });

    return sectionRenderer({
        ...renderProps,
        DefaultSectionRenderer: DashboardLayoutSectionRenderer,
        children: (
            <>
                {sectionHeaderRenderer &&
                    sectionHeaderRenderer({
                        section,
                        screen,
                        DefaultSectionHeaderRenderer: DashboardLayoutSectionHeaderRenderer,
                    })}
                {items}
            </>
        ),
    });
}
