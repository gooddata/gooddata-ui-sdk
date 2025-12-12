// (C) 2022-2025 GoodData Corporation

import { useEffect, useRef } from "react";

import cx from "classnames";

import {
    OverlayController,
    OverlayControllerProvider,
    ToastsCenter,
    ToastsCenterContextProvider,
} from "@gooddata/sdk-ui-kit";

import { DashboardScreenSizeProvider } from "./DashboardScreenSizeContext.js";
import {
    selectAccessibleDashboardsLoaded,
    selectCatalogIsLoaded,
    selectIsInEditMode,
    selectLocale,
    useDashboardAutomations,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    DASHBOARD_HEADER_OVERLAYS_Z_INDEX,
    DASHBOARD_TOASTS_OVERLAY_Z_INDEX,
} from "../../constants/index.js";
import {
    DeleteDropZone,
    WrapInsightListItemWithDrag,
    useDashboardDragScroll,
} from "../../dragAndDrop/index.js";
import { WrapCreatePanelItemWithDrag } from "../../dragAndDrop/WrapCreatePanelItemWithDrag.js";
import { DragLayerComponent as FlexibleDragLayerComponent } from "../../flexibleLayout/dragAndDrop/DragLayer.js";
import { IntlWrapper } from "../../localization/index.js";
import { Toolbar } from "../../toolbar/index.js";
import { DashboardContent } from "../DashboardContent.js";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader.js";
import { DashboardSidebar } from "../DashboardSidebar/DashboardSidebar.js";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar.js";
import { type IDashboardProps } from "../types.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);
const toastsOverlayController = OverlayController.getInstance(DASHBOARD_TOASTS_OVERLAY_Z_INDEX);

export function DashboardInner(props: IDashboardProps) {
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const accessibleDashboardsLoaded = useDashboardSelector(selectAccessibleDashboardsLoaded);

    const headerRef = useRef<HTMLDivElement | null>(null);
    const layoutRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useDashboardDragScroll(layoutRef, headerRef, bottomRef);
    const { initializeAutomations } = useDashboardAutomations();

    useEffect(() => {
        initializeAutomations();
    }, [initializeAutomations]);

    const DragLayerComponent = FlexibleDragLayerComponent;

    const mainContentNavigationConfig = props.keyboardNavigation?.mainContent;

    const mainContentNavigationProps = mainContentNavigationConfig
        ? {
              tabIndex: mainContentNavigationConfig.tabIndex,
              id: mainContentNavigationConfig.targetElementId,
              role: "main",
              ["aria-label"]: mainContentNavigationConfig.ariaLabel,
          }
        : {};

    return (
        <IntlWrapper locale={locale}>
            <ToastsCenterContextProvider skipAutomaticMessageRendering>
                <OverlayControllerProvider overlayController={toastsOverlayController}>
                    <ToastsCenter />
                </OverlayControllerProvider>

                {/* we need wrapping element for drag layer and dashboard for proper rendering in flex layout */}
                <div
                    className={cx("component-root", {
                        "sdk-edit-mode-on": isEditMode,
                        "catalog-is-loaded": isCatalogLoaded,
                        "accessible-dashboards-loaded": accessibleDashboardsLoaded,
                    })}
                >
                    <DragLayerComponent />
                    <div className="gd-dashboards-root gd-flex-container">
                        <DashboardSidebar
                            DefaultSidebar={RenderModeAwareDashboardSidebar}
                            DeleteDropZoneComponent={DeleteDropZone}
                            WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDrag}
                            WrapInsightListItemWithDragComponent={WrapInsightListItemWithDrag}
                        />
                        <main className="gd-dash-content" {...mainContentNavigationProps}>
                            {/* gd-dash-header-wrapper-sdk-8-12 style is added because we should keep old styles unchanged to not brake plugins */}
                            <div
                                className="gd-dash-header-wrapper gd-dash-header-wrapper-sdk-8-12"
                                ref={headerRef}
                            >
                                {/* Header z-index start at  6000, so we need force all overlays z-indexes start at 6000 to be under header */}
                                <OverlayControllerProvider overlayController={overlayController}>
                                    <DashboardHeader />
                                </OverlayControllerProvider>
                            </div>
                            <div
                                className="gd-flex-item-stretch dash-section dash-section-kpis"
                                ref={layoutRef}
                            >
                                <DashboardScreenSizeProvider>
                                    <DashboardContent {...props} />
                                </DashboardScreenSizeProvider>
                            </div>
                            <div className="gd-dash-bottom-position-pixel" ref={bottomRef} />
                        </main>
                    </div>
                    <Toolbar />
                </div>
            </ToastsCenterContextProvider>
        </IntlWrapper>
    );
}
