// (C) 2007-2024 GoodData Corporation
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";
import flatMap from "lodash/flatMap.js";
import React, { useMemo } from "react";
import { RenderMode, ILayoutItemPath } from "../../../types.js";
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
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
import { getItemIndex, serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

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
    renderMode: RenderMode;
    isDraggingWidget?: boolean;
    parentLayoutItemSize?: IDashboardLayoutSizeByScreenSize;
    parentLayoutPath: ILayoutItemPath | undefined;
}

const defaultSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => (
    <DashboardLayoutSectionRenderer {...props} />
);

const defaultHeaderRenderer: IDashboardLayoutSectionHeaderRenderer<unknown> = (props) => (
    <DashboardLayoutSectionHeaderRenderer {...props} />
);

const defaultItemKeyGetter: IDashboardLayoutItemKeyGetter<unknown> = ({ item }) =>
    serializeLayoutItemPath(item.index());

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
        renderMode,
        parentLayoutItemSize,
        parentLayoutPath,
    } = props;
    const renderProps = { section, renderMode, parentLayoutItemSize, parentLayoutPath };
    const screen = useScreenSize();

    const items = useMemo(() => {
        if (renderMode === "edit") {
            const itemsInRowsByIndex = section
                .items()
                .asGridRows(screen)
                .map(
                    (itemsInRow) =>
                        [getItemIndex(last(itemsInRow)!.index()), itemsInRow] as [
                            number,
                            IDashboardLayoutItemFacade<TWidget>[],
                        ],
                );

            const itemsInRow = section.items().all();

            return (
                <DashboardLayoutGridRowEdit
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
        section,
        widgetRenderer,
        screen,
    ]);

    return sectionRenderer({
        ...renderProps,
        DefaultSectionRenderer: DashboardLayoutSectionRenderer,
        children: (
            <>
                {sectionHeaderRenderer({
                    section,
                    DefaultSectionHeaderRenderer: DashboardLayoutSectionHeaderRenderer,
                    parentLayoutItemSize,
                    parentLayoutPath,
                })}
                {items}
                {renderMode === "edit" ? <DashboardLayoutSectionOverlayController section={section} /> : null}
            </>
        ),
    });
}
