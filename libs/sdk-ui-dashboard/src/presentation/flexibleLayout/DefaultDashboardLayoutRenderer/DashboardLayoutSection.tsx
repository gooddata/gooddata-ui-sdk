// (C) 2007-2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { isEmpty } from "lodash-es";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import {
    type IDashboardLayoutItemFacade,
    type IDashboardLayoutSectionFacade,
} from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { getLayoutConfiguration } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { getItemIndex, serializeLayoutItemPath } from "../../../_staging/layout/coordinates.js";
import { type ILayoutItemPath, type RenderMode } from "../../../types.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { useSlideSizeStyle } from "../../dashboardContexts/useSlideData.js";
import { useSectionExportData } from "../../export/useExportData.js";

import { DashboardLayoutGridRow } from "./DashboardLayoutGridRow.js";
import { DashboardLayoutGridRowEdit } from "./DashboardLayoutGridRowEdit.js";
import { DashboardLayoutSectionHeaderRenderer } from "./DashboardLayoutSectionHeaderRenderer.js";
import { DashboardLayoutSectionRenderer } from "./DashboardLayoutSectionRenderer.js";
import {
    type IDashboardLayoutGridRowRenderer,
    type IDashboardLayoutItemKeyGetter,
    type IDashboardLayoutItemRenderer,
    type IDashboardLayoutSectionHeaderRenderer,
    type IDashboardLayoutSectionKeyGetter,
    type IDashboardLayoutSectionRenderer,
    type IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";

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

/**
 * Whether the section header has anything to render, i.e. whether it occupies a grid row of the
 * section. Mirrors the conditions of {@link DashboardLayoutViewSectionHeader} and of the section
 * header renderers, which for an empty header emit a grid item that `.gd-grid-layout__item:empty`
 * takes out of the flow.
 *
 * The export slide sizing needs this to know which grid row is the header one. Only ever consulted
 * together with the node the header renderer actually returned - see `hasHeaderRow` below.
 */
function hasVisibleSectionHeader<TWidget>(section: IDashboardLayoutSectionFacade<TWidget>): boolean {
    const { sections } = getLayoutConfiguration(section.layout().raw());
    return sections.areHeadersEnabled && (!isEmpty(section.title()) || !isEmpty(section.description()));
}

export function DashboardLayoutSection<TWidget>({
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
}: IDashboardLayoutSectionProps<TWidget>): ReactElement {
    const showBorders = parentLayoutPath === undefined || parentLayoutPath.length === 0;
    const exportData = useSectionExportData(parentLayoutPath?.length ?? 0);

    const header = sectionHeaderRenderer({
        section,
        DefaultSectionHeaderRenderer:
            DashboardLayoutSectionHeaderRenderer as IDashboardLayoutSectionHeaderRenderer<unknown>,
        parentLayoutItemSize,
        parentLayoutPath,
        exportData,
    });

    // sectionHeaderRenderer is a swappable callback, so the section metadata alone does not decide
    // whether a header row exists - a custom renderer may return null for a section that has a title.
    // Require both, so we never reserve a content-sized row that then gets filled by the first
    // widget (which would collapse it, the very thing the export row sizing is fixing).
    const hasHeaderRow = header !== null && header !== undefined && hasVisibleSectionHeader(section);

    const exportStyles = useSlideSizeStyle(renderMode, "section", parentLayoutPath, hasHeaderRow);
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
                        [getItemIndex(itemsInRow.at(-1)!.index()), itemsInRow] as [
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

        return section
            .items()
            .asGridRows(screen)
            .flatMap((itemsInRow, index) => {
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
                {header}
                {items}
            </>
        ),
    });
}
