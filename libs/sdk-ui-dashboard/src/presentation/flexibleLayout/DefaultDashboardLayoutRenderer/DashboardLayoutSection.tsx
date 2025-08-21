// (C) 2007-2025 GoodData Corporation
import React, { ReactElement, useMemo } from "react";

import flatMap from "lodash/flatMap.js";
import last from "lodash/last.js";

import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { DashboardLayoutGridRow } from "./DashboardLayoutGridRow.js";
import { DashboardLayoutGridRowEdit } from "./DashboardLayoutGridRowEdit.js";
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
import {
    IDashboardLayoutItemFacade,
    IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { getItemIndex, serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { ILayoutItemPath, RenderMode } from "../../../types.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { useSlideSizeStyle } from "../../dashboardContexts/index.js";
import { useSectionExportData } from "../../export/index.js";
import { DashboardLayoutSectionOverlayController } from "../DashboardItemOverlay/DashboardItemOverlayController.js";

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

export function DashboardLayoutSection<TWidget>(props: IDashboardLayoutSectionProps<TWidget>): ReactElement {
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
    const showBorders = parentLayoutPath === undefined || parentLayoutPath.length === 0;
    const exportData = useSectionExportData(parentLayoutPath?.length ?? 0);
    const exportStyles = useSlideSizeStyle(renderMode, "section", parentLayoutPath);
    const renderProps = {
        section,
        renderMode,
        parentLayoutItemSize,
        parentLayoutPath,
        showBorders,
        exportData: exportData?.section,
    };
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
                    // The information is required by the interface but edit row counts the indexes of rows
                    // in the inside of the component, unlike view row component.
                    rowIndex={-1}
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
                    rowIndex={index}
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
        exportStyles,
        DefaultSectionRenderer: DashboardLayoutSectionRenderer as IDashboardLayoutSectionRenderer<unknown>,
        children: (
            <>
                {sectionHeaderRenderer({
                    section,
                    DefaultSectionHeaderRenderer: DashboardLayoutSectionHeaderRenderer,
                    parentLayoutItemSize,
                    parentLayoutPath,
                    exportData,
                })}
                {items}
                {renderMode === "edit" ? <DashboardLayoutSectionOverlayController section={section} /> : null}
            </>
        ),
    });
}
