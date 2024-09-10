// (C) 2007-2024 GoodData Corporation
import { IDashboardLayout /*, ScreenSize, IDashboardWidget*/ } from "@gooddata/sdk-model";
import cx from "classnames";
import isEqual from "lodash/isEqual.js";
import React, { useCallback, useMemo } from "react";
// import {
//     Col,
//     Container,
//     ScreenClass,
//     ScreenClassProvider,
//     ScreenClassRender,
//     setConfiguration,
// } from "react-grid-system";
import { DashboardLayoutFacade } from "../../../_staging/dashboard/fluidLayout/facade/layout.js";
// import { DASHBOARD_LAYOUT_GRID_CONFIGURATION } from "../../constants/index.js";
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
    implicitLayoutItemSizeFromXlSize,
} from "./utils/sizing.js";
import { GRID_COLUMNS_COUNT } from "./constants.js";
import { useScreenSize } from "./useScreenSize.js";

// setConfiguration(DASHBOARD_LAYOUT_GRID_CONFIGURATION);

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
        sectionKeyGetter = defaultSectionKeyGetter,
        sectionRenderer,
        sectionHeaderRenderer,
        itemKeyGetter,
        itemRenderer,
        widgetRenderer,
        gridRowRenderer,
        className,
        debug,
        onMouseLeave,
        enableCustomHeight,
        renderMode = "view",
        isNestedLayout,
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
                    debug,
                })
            ) : (
                <renderProps.DefaultSectionRenderer {...renderProps} debug={debug} />
            ),
        [debug, sectionRenderer],
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
                    debug,
                    getLayoutDimensions: getLayoutDimensions,
                })
            ) : (
                <renderProps.DefaultWidgetRenderer
                    {...renderProps}
                    debug={debug}
                    isResizedByLayoutSizingStrategy={isResizedByLayoutSizingStrategy}
                    getLayoutDimensions={getLayoutDimensions}
                />
            );
        },
        [debug, resizedItemPositions, widgetRenderer],
    );

    const detectedScreenSize = useScreenSize(layoutRef);
    const screenSize = providedScreen ?? detectedScreenSize;

    // TODO handle undefined size?
    const possibleLayoutSizes = implicitLayoutItemSizeFromXlSize(layout.size!);
    const layoutSize = possibleLayoutSizes[screenSize];

    return (
        <div
            // className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            className={cx("gd-dashboards", className, {
                "gd-grid-layout__container": !isNestedLayout,
                "gd-grid-layout__item": isNestedLayout,
                "gd-grid-layout__item--container": isNestedLayout,
                [`gd-grid-layout__item--span-${layoutSize?.gridWidth ?? GRID_COLUMNS_COUNT}`]: isNestedLayout,
            })}
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
                    />
                );
            })}
            {/*<ScreenClassProvider useOwnWidth={false}>*/}
            {/*    <ScreenClassRender*/}
            {/*        render={(screenClass: ScreenClass) => {*/}
            {/*            const screen = screenClass as ScreenSize;*/}
            {/*            return screen ? (*/}
            {/*                <LayoutContainer item={layout} isNestedLayout={isNestedLayout}>*/}
            {/*                    {layoutFacade.sections().map((section) => {*/}
            {/*                        return (*/}
            {/*                            <DashboardLayoutSection*/}
            {/*                                key={sectionKeyGetter({ section, screen })}*/}
            {/*                                section={section}*/}
            {/*                                sectionRenderer={sectionRendererWrapped}*/}
            {/*                                sectionHeaderRenderer={sectionHeaderRenderer}*/}
            {/*                                itemKeyGetter={itemKeyGetter}*/}
            {/*                                itemRenderer={itemRenderer}*/}
            {/*                                gridRowRenderer={gridRowRenderer}*/}
            {/*                                widgetRenderer={widgetRendererWrapped}*/}
            {/*                                screen={screen}*/}
            {/*                                renderMode={renderMode}*/}
            {/*                                getLayoutDimensions={getLayoutDimensions}*/}
            {/*                            />*/}
            {/*                        );*/}
            {/*                    })}*/}
            {/*                </LayoutContainer>*/}
            {/*            ) : null;*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</ScreenClassProvider>*/}
        </div>
    );
}
