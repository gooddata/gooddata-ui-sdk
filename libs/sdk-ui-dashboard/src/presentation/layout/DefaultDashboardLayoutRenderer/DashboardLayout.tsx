// (C) 2007-2025 GoodData Corporation
import { IDashboardLayout, ScreenSize } from "@gooddata/sdk-model";
import cx from "classnames";
import isEqual from "lodash/isEqual.js";
import React, { ReactElement, useCallback, useMemo } from "react";
import {
    Container,
    ScreenClass,
    ScreenClassProvider,
    ScreenClassRender,
    setConfiguration,
} from "react-grid-system";
import { DashboardLayoutFacade } from "../../../_staging/dashboard/legacyFluidLayout/facade/layout.js";
import { DASHBOARD_LAYOUT_GRID_CONFIGURATION } from "../../constants/index.js";
import { layoutTransformer } from "../../../_staging/slideshow/index.js";
import { useSlideSizeStyle } from "../../dashboardContexts/index.js";
import { emptyDOMRect } from "../../constants.js";

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
import { useDashboardExportData } from "../../export/index.js";

setConfiguration(DASHBOARD_LAYOUT_GRID_CONFIGURATION);

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
        debug,
        onMouseLeave,
        exportTransformer,
        enableCustomHeight,
        renderMode = "view",
        focusObject,
    } = props;

    const layoutRef = React.useRef<HTMLDivElement>(null);

    const { layoutFacade, resizedItemPositions } = useMemo(() => {
        const updatedLayout = removeHeights(layout, !!enableCustomHeight);

        const exportMode = renderMode === "export";
        let unifiedLayout = unifyDashboardLayoutItemHeights(updatedLayout);
        if (exportMode) {
            unifiedLayout =
                exportTransformer?.(unifiedLayout, focusObject) ??
                layoutTransformer<TWidget>(unifiedLayout, focusObject);
        }

        const layoutFacade = DashboardLayoutFacade.for(unifiedLayout);
        const resizedItemPositions = exportMode ? [] : getResizedItemPositions(layout, layoutFacade.raw());
        return { layoutFacade, resizedItemPositions };
    }, [layout, enableCustomHeight, exportTransformer, renderMode, focusObject]);

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

    const slideStyles = useSlideSizeStyle(renderMode, "root");
    const exportData = useDashboardExportData(renderMode, "loaded", "root");

    return (
        <div
            className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            onMouseLeave={onMouseLeave}
            ref={layoutRef}
            style={slideStyles}
            {...exportData}
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
                                            getLayoutDimensions={getLayoutDimensions}
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
