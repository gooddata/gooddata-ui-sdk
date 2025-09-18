// (C) 2007-2025 GoodData Corporation

import { ReactElement, useCallback, useMemo, useRef } from "react";

import cx from "classnames";
import isEqual from "lodash/isEqual.js";

import { DashboardLayoutSection } from "./DashboardLayoutSection.js";
import { GridLayoutElement } from "./GridLayoutElement.js";
import {
    IDashboardLayoutRenderProps,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import { getResizedItemPositions, unifyDashboardLayoutItemHeights } from "./utils/sizing.js";
import { DashboardLayoutFacade } from "../../../_staging/dashboard/flexibleLayout/facade/layout.js";
import { getItemIndex, serializeLayoutSectionPath } from "../../../_staging/layout/coordinates.js";
import { layoutTransformer } from "../../../_staging/slideshow/index.js";
import { ILayoutSectionPath } from "../../../types.js";
import { isInitialPlaceholderWidget } from "../../../widgets/index.js";
import { emptyDOMRect } from "../../constants.js";
import { useDashboardItemPathAndSize } from "../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { useSlideSizeStyle } from "../../dashboardContexts/index.js";
import { useDashboardExportData } from "../../export/index.js";
import { SectionHotspot } from "../dragAndDrop/draggableWidget/SectionHotspot.js";

const defaultSectionKeyGetter: IDashboardLayoutSectionKeyGetter<unknown> = ({ section }) =>
    serializeLayoutSectionPath(section.index());

/**
 * DashboardLayout is customizable component for rendering {@link IDashboardLayout}.
 *
 * @alpha
 */
export function DashboardLayout<TWidget>(props: IDashboardLayoutRenderProps<TWidget>): ReactElement {
    const {
        layout,
        sectionKeyGetter = defaultSectionKeyGetter,
        sectionRenderer,
        sectionHeaderRenderer,
        itemKeyGetter,
        itemRenderer,
        widgetRenderer,
        gridRowRenderer,
        className,
        onMouseLeave,
        exportTransformer,
        renderMode = "view",
        focusObject,
    } = props;

    const layoutRef = useRef<HTMLDivElement>(null);
    const { layoutItemPath, layoutItemSize } = useDashboardItemPathAndSize();

    const { layoutFacade, resizedItemPositions } = useMemo(() => {
        const exportMode = renderMode === "export" && layoutItemPath === undefined;
        let unifiedLayout = unifyDashboardLayoutItemHeights(layout, layoutItemSize, layoutItemPath);
        if (exportMode) {
            unifiedLayout =
                exportTransformer?.(unifiedLayout, focusObject) ??
                layoutTransformer<TWidget>(unifiedLayout, focusObject);
        }

        const layoutFacade = DashboardLayoutFacade.for(unifiedLayout, layoutItemPath);
        const resizedItemPositions = exportMode
            ? []
            : getResizedItemPositions(layout, layoutFacade.raw(), [], layoutItemPath);
        return { layoutFacade, resizedItemPositions };
    }, [layout, renderMode, layoutItemPath, layoutItemSize, exportTransformer, focusObject]);

    const sectionRendererWrapped = useCallback<IDashboardLayoutSectionRenderer<TWidget>>(
        (renderProps) =>
            sectionRenderer ? (
                sectionRenderer({
                    ...renderProps,
                })
            ) : (
                <renderProps.DefaultSectionRenderer {...renderProps} />
            ),
        [sectionRenderer],
    );

    const getLayoutDimensions = useCallback(function (): DOMRect {
        return layoutRef?.current ? layoutRef.current.getBoundingClientRect() : emptyDOMRect;
    }, []);

    const widgetRendererWrapped = useCallback<IDashboardLayoutWidgetRenderer<TWidget>>(
        (renderProps) => {
            const isResizedByLayoutSizingStrategy = resizedItemPositions.some((position) =>
                isEqual(position, [
                    renderProps.item.section().index().sectionIndex,
                    getItemIndex(renderProps.item.index()),
                ]),
            );

            return widgetRenderer ? (
                widgetRenderer({
                    ...renderProps,
                    isResizedByLayoutSizingStrategy,
                    getLayoutDimensions: getLayoutDimensions,
                })
            ) : (
                <renderProps.DefaultWidgetRenderer
                    {...renderProps}
                    isResizedByLayoutSizingStrategy={isResizedByLayoutSizingStrategy}
                    getLayoutDimensions={getLayoutDimensions}
                />
            );
        },
        [resizedItemPositions, widgetRenderer, getLayoutDimensions],
    );

    const screenSize = useScreenSize();
    const isNestedLayout = layoutItemPath !== undefined;
    const type = isNestedLayout ? "nested" : "root";

    const sectionIndex = useMemo(
        (): ILayoutSectionPath => ({
            parent: layoutItemPath,
            sectionIndex: layout.sections.length,
        }),
        [layout, layoutItemPath],
    );

    // do not render the tailing section hotspot if there is only one section in the layout, and it has only initial placeholders in it
    const shouldRenderSectionHotspot =
        renderMode === "edit" &&
        (layout.sections.length > 1 ||
            (layout.sections.length === 1 &&
                layout.sections[0].items.some((i) => !isInitialPlaceholderWidget(i.widget)) &&
                !isNestedLayout));

    const slideStyles = useSlideSizeStyle(renderMode, type);
    const exportData = useDashboardExportData(renderMode, "loaded", type);

    return (
        <GridLayoutElement
            type={type}
            layoutItemSize={layoutItemSize}
            className={cx(
                {
                    "gd-dashboards": !isNestedLayout,
                },
                className,
            )}
            onMouseLeave={onMouseLeave}
            ref={layoutRef}
            exportStyles={slideStyles}
            exportData={exportData}
        >
            {layoutFacade.sections().map((section) => {
                return (
                    <DashboardLayoutSection
                        key={sectionKeyGetter({ section, screen: screenSize })}
                        section={section}
                        sectionRenderer={sectionRendererWrapped}
                        sectionHeaderRenderer={sectionHeaderRenderer}
                        itemKeyGetter={itemKeyGetter}
                        itemRenderer={itemRenderer}
                        gridRowRenderer={gridRowRenderer}
                        widgetRenderer={widgetRendererWrapped}
                        renderMode={renderMode}
                        getLayoutDimensions={getLayoutDimensions}
                        parentLayoutItemSize={layoutItemSize}
                        parentLayoutPath={layoutItemPath}
                    />
                );
            })}
            {shouldRenderSectionHotspot ? (
                <GridLayoutElement type="item" layoutItemSize={layoutItemSize}>
                    <SectionHotspot index={sectionIndex} targetPosition="below" itemSize={layoutItemSize} />
                </GridLayoutElement>
            ) : null}
        </GridLayoutElement>
    );
}
