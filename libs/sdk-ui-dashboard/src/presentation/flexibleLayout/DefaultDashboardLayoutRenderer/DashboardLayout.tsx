// (C) 2007-2024 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";
import cx from "classnames";
import isEqual from "lodash/isEqual.js";
import React, { useCallback, useMemo } from "react";

import { DashboardLayoutFacade } from "../../../_staging/dashboard/fluidLayout/facade/layout.js";
import { emptyDOMRect } from "../constants.js";

import { DashboardLayoutSection } from "./DashboardLayoutSection.js";
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
import { useScreenSize } from "./useScreenSize.js";
import { GridLayoutElement } from "./GridLayoutElement.js";

const removeHeights = <TWidget,>(layout: IDashboardLayout<TWidget>, enableCustomHeight: boolean) => {
    if (enableCustomHeight) {
        return layout;
    }

    return getLayoutWithoutGridHeights(layout);
};

const defaultSectionKeyGetter: IDashboardLayoutSectionKeyGetter<unknown> = ({ section }) =>
    section.index().toString();

/**
 * DashboardLayout is customizable component for rendering {@link IDashboardLayout}.
 *
 * @alpha
 */
export function DashboardLayout<TWidget>(props: IDashboardLayoutRenderProps<TWidget>): JSX.Element {
    const {
        layout,
        screen: providedScreen,
        parentLayoutItemSize,
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
        renderMode = "view",
    } = props;

    const layoutRef = React.useRef<HTMLDivElement>(null);

    const { layoutFacade, resizedItemPositions } = useMemo(() => {
        const updatedLayout = removeHeights(layout, !!enableCustomHeight);
        const layoutFacade = DashboardLayoutFacade.for(unifyDashboardLayoutItemHeights(updatedLayout));
        const resizedItemPositions = getResizedItemPositions(layout, layoutFacade.raw());
        return { layoutFacade, resizedItemPositions };
    }, [layout, enableCustomHeight]);

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
                isEqual(position, [renderProps.item.section().index(), renderProps.item.index()]),
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

    const detectedScreenSize = useScreenSize(layoutRef);
    const screenSize = providedScreen ?? detectedScreenSize;
    const isNestedLayout = parentLayoutItemSize !== undefined;

    return (
        <GridLayoutElement
            type={isNestedLayout ? "nested" : "root"}
            screen={screenSize}
            layoutItemSize={parentLayoutItemSize}
            className={cx(
                {
                    "gd-dashboards": !isNestedLayout,
                },
                className,
            )}
            onMouseLeave={onMouseLeave}
            ref={layoutRef}
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
                        screen={screenSize}
                        renderMode={renderMode}
                        getLayoutDimensions={getLayoutDimensions}
                        parentLayoutItemSize={parentLayoutItemSize}
                    />
                );
            })}
        </GridLayoutElement>
    );
}
