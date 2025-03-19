// (C) 2007-2025 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";
import cx from "classnames";
import isEqual from "lodash/isEqual.js";
import React, { useCallback, useMemo } from "react";

import { DashboardLayoutFacade } from "../../../_staging/dashboard/flexibleLayout/facade/layout.js";
import { useDashboardItemPathAndSize } from "../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { serializeLayoutSectionPath, getItemIndex } from "../../../_staging/layout/coordinates.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { SectionHotspot } from "../dragAndDrop/draggableWidget/SectionHotspot.js";
import { isInitialPlaceholderWidget } from "../../../widgets/index.js";
import { layoutTransformer } from "../../../_staging/slideshow/index.js";
import { useSlideSizeStyle } from "../../dashboardContexts/index.js";
import { ILayoutSectionPath } from "../../../types.js";
import { emptyDOMRect } from "../../constants.js";

import { DashboardLayoutSection } from "./DashboardLayoutSection.js";
import { GridLayoutElement } from "./GridLayoutElement.js";
import {
    IDashboardLayoutRenderProps,
    IDashboardLayoutSectionKeyGetter,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces.js";
import {
    getLayoutWithoutGridHeights,
    getResizedItemPositions,
    unifyDashboardLayoutItemHeights,
} from "./utils/sizing.js";

const removeHeights = <TWidget,>(layout: IDashboardLayout<TWidget>, enableCustomHeight: boolean) => {
    if (enableCustomHeight) {
        return layout;
    }

    return getLayoutWithoutGridHeights(layout);
};

const defaultSectionKeyGetter: IDashboardLayoutSectionKeyGetter<unknown> = ({ section }) =>
    serializeLayoutSectionPath(section.index());

/**
 * DashboardLayout is customizable component for rendering {@link IDashboardLayout}.
 *
 * @alpha
 */
export function DashboardLayout<TWidget>(props: IDashboardLayoutRenderProps<TWidget>): JSX.Element {
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
        enableCustomHeight,
        exportTransformer,
        renderMode = "view",
        focusObject,
    } = props;

    const layoutRef = React.useRef<HTMLDivElement>(null);
    const { itemPath, itemSize } = useDashboardItemPathAndSize();

    const { layoutFacade, resizedItemPositions } = useMemo(() => {
        const updatedLayout = removeHeights(layout, !!enableCustomHeight);

        const exportMode = renderMode === "export" && itemPath === undefined;
        let unifiedLayout = unifyDashboardLayoutItemHeights(updatedLayout, itemSize, itemPath);
        if (exportMode) {
            unifiedLayout =
                exportTransformer?.(unifiedLayout, focusObject) ??
                layoutTransformer<TWidget>(unifiedLayout, focusObject);
        }

        const layoutFacade = DashboardLayoutFacade.for(unifiedLayout, itemPath);
        const resizedItemPositions = exportMode
            ? []
            : getResizedItemPositions(layout, layoutFacade.raw(), [], itemPath);
        return { layoutFacade, resizedItemPositions };
    }, [layout, enableCustomHeight, renderMode, itemPath, itemSize, exportTransformer, focusObject]);

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
        [resizedItemPositions, widgetRenderer],
    );

    const screenSize = useScreenSize();
    const isNestedLayout = itemPath !== undefined;
    const type = isNestedLayout ? "nested" : "root";

    const sectionIndex = useMemo(
        (): ILayoutSectionPath => ({
            parent: itemPath,
            sectionIndex: layout.sections.length,
        }),
        [layout, itemPath],
    );

    // do not render the tailing section hotspot if there is only one section in the layout, and it has only initial placeholders in it
    const shouldRenderSectionHotspot =
        renderMode === "edit" &&
        (layout.sections.length > 1 ||
            (layout.sections.length === 1 &&
                layout.sections[0].items.some((i) => !isInitialPlaceholderWidget(i.widget)) &&
                !isNestedLayout));

    const slideStyles = useSlideSizeStyle(renderMode, type);

    return (
        <GridLayoutElement
            type={type}
            layoutItemSize={itemSize}
            className={cx(
                {
                    "gd-dashboards": !isNestedLayout,
                },
                className,
            )}
            onMouseLeave={onMouseLeave}
            ref={layoutRef}
            exportStyles={slideStyles}
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
                        parentLayoutItemSize={itemSize}
                        parentLayoutPath={itemPath}
                    />
                );
            })}
            {shouldRenderSectionHotspot ? (
                <GridLayoutElement type="item" layoutItemSize={itemSize}>
                    <SectionHotspot index={sectionIndex} targetPosition="below" itemSize={itemSize} />
                </GridLayoutElement>
            ) : null}
        </GridLayoutElement>
    );
}
