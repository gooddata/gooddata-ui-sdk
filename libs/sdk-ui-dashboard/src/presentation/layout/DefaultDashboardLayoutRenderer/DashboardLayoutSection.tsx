// (C) 2007-2022 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap";
import React from "react";
import { RenderMode } from "../../../types";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/fluidLayout/facade/interfaces";
import { DashboardLayoutGridRow } from "./DashboardLayoutGridRow";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer";
import {
    IDashboardLayoutGridRowRenderer,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutSectionHeaderRenderer,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces";

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
    getLayoutDimensions: () => DOMRect;
    screen: ScreenSize;
    renderMode: RenderMode;
}

export function DashboardLayoutSection<TWidget>(props: IDashboardLayoutSectionProps<TWidget>): JSX.Element {
    const {
        section,
        sectionRenderer = DashboardLayoutSectionRenderer,
        sectionHeaderRenderer = DashboardLayoutSectionHeaderRenderer,
        itemKeyGetter = ({ item }) => item.index().toString(),
        gridRowRenderer,
        itemRenderer,
        widgetRenderer,
        getLayoutDimensions,
        screen,
        renderMode,
    } = props;
    const renderProps = { section, screen, renderMode };

    const items = flatMap(section.items().asGridRows(screen), (itemsInRow) => {
        const rowKey = itemsInRow.map((item) => itemKeyGetter({ item, screen })).join(";");
        return (
            <DashboardLayoutGridRow
                key={rowKey}
                screen={screen}
                section={section}
                items={itemsInRow}
                gridRowRenderer={gridRowRenderer}
                itemKeyGetter={itemKeyGetter}
                itemRenderer={itemRenderer}
                widgetRenderer={widgetRenderer}
                renderMode={renderMode}
                getLayoutDimensions={getLayoutDimensions}
            />
        );
    });

    return sectionRenderer({
        ...renderProps,
        DefaultSectionRenderer: DashboardLayoutSectionRenderer,
        children: (
            <>
                {sectionHeaderRenderer({
                    section,
                    screen,
                    DefaultSectionHeaderRenderer: DashboardLayoutSectionHeaderRenderer,
                })}
                {items}
            </>
        ),
    });
}
