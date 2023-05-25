// (C) 2007-2023 GoodData Corporation
import { ScreenSize } from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap.js";
import React, { useMemo } from "react";
import { RenderMode } from "../../../types.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/fluidLayout/facade/interfaces.js";
import { DashboardLayoutGridRow } from "./DashboardLayoutGridRow.js";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer.js";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer.js";
import {
    IDashboardLayoutGridRowRenderer,
    IDashboardLayoutItemKeyGetter,
    IDashboardLayoutItemRenderer,
    IDashboardLayoutSectionHeaderRenderer,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import { DashboardLayoutSectionOverlayController } from "../DashboardItemOverlay/DashboardItemOverlayController.js";
import last from "lodash/last.js";
import { DashboardLayoutGridRowEdit } from "./DashboardLayoutGridRowEdit.js";

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
    isDraggingWidget?: boolean;
}

const defaultSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => (
    <DashboardLayoutSectionRenderer {...props} />
);

const defaultHeaderRenderer: IDashboardLayoutSectionHeaderRenderer<unknown> = (props) => (
    <DashboardLayoutSectionHeaderRenderer {...props} />
);

const defaultItemKeyGetter: IDashboardLayoutItemKeyGetter<unknown> = ({ item }) => item.index().toString();

export function DashboardLayoutSection<TWidget>(props: IDashboardLayoutSectionProps<TWidget>): JSX.Element {
    const {
        section,
        sectionRenderer = defaultSectionRenderer,
        sectionHeaderRenderer = defaultHeaderRenderer,
        itemKeyGetter = defaultItemKeyGetter,
        gridRowRenderer,
        itemRenderer,
        widgetRenderer,
        getLayoutDimensions,
        screen,
        renderMode,
    } = props;
    const renderProps = { section, screen, renderMode };

    const items = useMemo(() => {
        if (renderMode === "edit") {
            const itemsInRowsByIndex = section
                .items()
                .asGridRows(screen)
                .map(
                    (itemsInRow) =>
                        [last(itemsInRow)!.index(), itemsInRow] as [
                            number,
                            IDashboardLayoutItemFacade<TWidget>[],
                        ],
                );

            const itemsInRow = section.items().all();

            return (
                <DashboardLayoutGridRowEdit
                    screen={screen}
                    itemsInRowsByIndex={itemsInRowsByIndex}
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
        }

        return flatMap(section.items().asGridRows(screen), (itemsInRow, index) => {
            return (
                <DashboardLayoutGridRow
                    key={index.toString()}
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
    }, [
        getLayoutDimensions,
        gridRowRenderer,
        itemKeyGetter,
        itemRenderer,
        renderMode,
        screen,
        section,
        widgetRenderer,
    ]);

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
                {renderMode === "edit" ? <DashboardLayoutSectionOverlayController section={section} /> : null}
            </>
        ),
    });
}
