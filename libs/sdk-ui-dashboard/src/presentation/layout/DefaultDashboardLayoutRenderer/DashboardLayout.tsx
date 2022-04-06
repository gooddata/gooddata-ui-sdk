// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import { Container, ScreenClassProvider, ScreenClassRender, setConfiguration } from "react-grid-system";
import { IDashboardLayout, ScreenSize } from "@gooddata/sdk-model";
import { DashboardLayoutSection } from "./DashboardLayoutSection";
import { IDashboardLayoutRenderProps } from "./interfaces";
import cx from "classnames";
import { DashboardLayoutFacade } from "../../../_staging/dashboard/fluidLayout/facade/layout";
import {
    getResizedItemPositions,
    unifyDashboardLayoutItemHeights,
    getLayoutWithoutGridHeights,
} from "./utils/sizing";
import isEqual from "lodash/isEqual";
import { DASHBOARD_LAYOUT_GRID_CONFIGURATION } from "../../constants";

setConfiguration(DASHBOARD_LAYOUT_GRID_CONFIGURATION);

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
    } = props;

    const removeHeights = (layout: IDashboardLayout<TWidget>, enableCustomHeight: boolean) => {
        if (enableCustomHeight) {
            return layout;
        }

        return getLayoutWithoutGridHeights(layout);
    };

    const { layoutFacade, resizedItemPositions } = useMemo(() => {
        const updatedLayout = removeHeights(layout, !!enableCustomHeight);
        const layoutFacade = DashboardLayoutFacade.for(unifyDashboardLayoutItemHeights(updatedLayout));
        const resizedItemPositions = getResizedItemPositions(layout, layoutFacade.raw());
        return { layoutFacade, resizedItemPositions };
    }, [layout, enableCustomHeight]);

    return (
        <div
            className={cx("gd-fluidlayout-container", "s-fluid-layout-container", "gd-dashboards", className)}
            onMouseLeave={onMouseLeave}
        >
            <ScreenClassProvider useOwnWidth={false}>
                <ScreenClassRender
                    render={(screen: ScreenSize) =>
                        screen ? (
                            <Container fluid={true} className="gd-fluidlayout-layout s-fluid-layout">
                                {layoutFacade.sections().map((section) => {
                                    return (
                                        <DashboardLayoutSection
                                            key={sectionKeyGetter({
                                                section,
                                                screen,
                                            })}
                                            section={section}
                                            sectionRenderer={(renderProps) =>
                                                sectionRenderer ? (
                                                    sectionRenderer({
                                                        ...renderProps,
                                                        debug,
                                                    })
                                                ) : (
                                                    <renderProps.DefaultSectionRenderer
                                                        {...renderProps}
                                                        debug={debug}
                                                    />
                                                )
                                            }
                                            sectionHeaderRenderer={sectionHeaderRenderer}
                                            itemKeyGetter={itemKeyGetter}
                                            itemRenderer={itemRenderer}
                                            gridRowRenderer={gridRowRenderer}
                                            widgetRenderer={(renderProps) => {
                                                const isResizedByLayoutSizingStrategy =
                                                    resizedItemPositions.some((position) =>
                                                        isEqual(position, [
                                                            renderProps.item.section().index(),
                                                            renderProps.item.index(),
                                                        ]),
                                                    );

                                                return widgetRenderer ? (
                                                    widgetRenderer({
                                                        ...renderProps,
                                                        isResizedByLayoutSizingStrategy,
                                                        debug,
                                                    })
                                                ) : (
                                                    <renderProps.DefaultWidgetRenderer
                                                        {...renderProps}
                                                        debug={debug}
                                                        isResizedByLayoutSizingStrategy={
                                                            isResizedByLayoutSizingStrategy
                                                        }
                                                    />
                                                );
                                            }}
                                            screen={screen}
                                        />
                                    );
                                })}
                            </Container>
                        ) : null
                    }
                />
            </ScreenClassProvider>
        </div>
    );
}
