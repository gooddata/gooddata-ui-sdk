// (C) 2007-2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import {
    Container,
    ScreenClass,
    ScreenClassProvider,
    ScreenClassRender,
    setConfiguration,
} from "react-grid-system";
import { IDashboardLayout, ScreenSize } from "@gooddata/sdk-model";
import { DashboardLayoutSection } from "./DashboardLayoutSection";
import {
    IDashboardLayoutRenderProps,
    IDashboardLayoutSectionRenderer,
    IDashboardLayoutWidgetRenderer,
} from "./interfaces";
import cx from "classnames";
import stringify from "json-stable-stringify";
import { DashboardLayoutFacade } from "../../../_staging/dashboard/fluidLayout/facade/layout";
import {
    getResizedItemPositions,
    unifyDashboardLayoutItemHeights,
    getLayoutWithoutGridHeights,
} from "./utils/sizing";
import isEqual from "lodash/isEqual";
import { DASHBOARD_LAYOUT_GRID_CONFIGURATION } from "../../constants";
import { emptyDOMRect } from "../constants";

setConfiguration(DASHBOARD_LAYOUT_GRID_CONFIGURATION);

const removeHeights = <TWidget,>(layout: IDashboardLayout<TWidget>, enableCustomHeight: boolean) => {
    if (enableCustomHeight) {
        return layout;
    }

    return getLayoutWithoutGridHeights(layout);
};

/**
 * DashboardLayout is customizable component for rendering {@link IDashboardLayout}.
 *
 * @alpha
 */
export function DashboardLayout<TWidget>(props: IDashboardLayoutRenderProps<TWidget>): JSX.Element {
    const {
        layout,
        sectionKeyGetter = ({ section }) => section.index(),
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

    const widgetRendererWrapped = useCallback<IDashboardLayoutWidgetRenderer<TWidget>>(
        (renderProps) => {
            function getLayoutDimensions(): DOMRect {
                return layoutRef?.current ? layoutRef.current.getBoundingClientRect() : emptyDOMRect;
            }

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
        [debug, stringify(resizedItemPositions), widgetRenderer],
    );

    return (
        <div
            className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            onMouseLeave={onMouseLeave}
            ref={layoutRef}
        >
            <ScreenClassProvider useOwnWidth={false}>
                <ScreenClassRender
                    render={(screenClass: ScreenClass) => {
                        const screen = screenClass as ScreenSize;
                        return screen ? (
                            <Container fluid={true} className="gd-fluidlayout-layout s-fluid-layout">
                                {layoutFacade.sections().map((section) => {
                                    return (
                                        <DashboardLayoutSection
                                            key={sectionKeyGetter({ section, screen })}
                                            section={section}
                                            sectionRenderer={sectionRendererWrapped}
                                            sectionHeaderRenderer={sectionHeaderRenderer}
                                            itemKeyGetter={itemKeyGetter}
                                            itemRenderer={itemRenderer}
                                            gridRowRenderer={gridRowRenderer}
                                            widgetRenderer={widgetRendererWrapped}
                                            screen={screen}
                                            renderMode={renderMode}
                                        />
                                    );
                                })}
                            </Container>
                        ) : null;
                    }}
                />
            </ScreenClassProvider>
        </div>
    );
}
