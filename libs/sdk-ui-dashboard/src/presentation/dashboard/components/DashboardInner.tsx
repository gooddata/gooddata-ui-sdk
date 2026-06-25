// (C) 2022-2026 GoodData Corporation

import { type CSSProperties, useEffect, useRef } from "react";

import cx from "classnames";

import {
    OverlayController,
    OverlayControllerProvider,
    ToastsCenter,
    ToastsCenterContextProvider,
} from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardAutomations } from "../../../model/react/useDashboardAutomations/useDashboardAutomations.js";
import { selectAccessibleDashboardsLoaded } from "../../../model/store/accessibleDashboards/accessibleDashboardsSelectors.js";
import { selectCatalogIsLoaded } from "../../../model/store/catalog/catalogSelectors.js";
import { selectLocale, selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectDashboardDensity } from "../../../model/store/ui/uiSelectors.js";
import {
    DASHBOARD_HEADER_OVERLAYS_Z_INDEX,
    DASHBOARD_TOASTS_OVERLAY_Z_INDEX,
} from "../../constants/zIndex.js";
import { DeleteDropZone } from "../../dragAndDrop/DeleteDropZone.js";
import { FilterDeleteOverlay } from "../../dragAndDrop/FilterDeleteOverlay.js";
import { useDashboardDragScroll } from "../../dragAndDrop/useDashboardDragScroll.js";
import { WrapCreatePanelItemWithDrag } from "../../dragAndDrop/WrapCreatePanelItemWithDrag.js";
import { WrapInsightListItemWithDrag } from "../../dragAndDrop/WrapInsightListItemWithDrag.js";
import { DragLayerComponent as FlexibleDragLayerComponent } from "../../flexibleLayout/dragAndDrop/DragLayer.js";
import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { Toolbar } from "../../toolbar/Toolbar.js";
import { DashboardContent } from "../DashboardContent.js";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader.js";
import { DashboardSidebar } from "../DashboardSidebar/DashboardSidebar.js";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar.js";
import {
    ResizableSidebarProvider,
    useResizableSidebarState,
} from "../DashboardSidebar/SidebarResizeContext.js";
import { type IDashboardProps } from "../types.js";

import { DashboardScreenSizeProvider } from "./DashboardScreenSizeContext.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);
const toastsOverlayController = OverlayController.getInstance(DASHBOARD_TOASTS_OVERLAY_Z_INDEX);

export function DashboardInner(props: IDashboardProps) {
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const accessibleDashboardsLoaded = useDashboardSelector(selectAccessibleDashboardsLoaded);
    const density = useDashboardSelector(selectDashboardDensity);
    const settings = useDashboardSelector(selectSettings);
    const enableEnhancedInsightPicker = settings?.enableEnhancedInsightPicker ?? false;

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

    const dashboardContentClassNames = cx("gd-dash-content", {
        "gd-dash-content--density-standard": density === "comfortable",
        "gd-dash-content--density-compact": density === "compact",
    });

    const resizableSidebar = useResizableSidebarState();

    // When the sidebar can be resized, expose its live width so the sibling content area can subtract
    // it (see `--gd-dashboard-sidebar-width` in sdk-dashboard.scss). Otherwise leave it unset so the
    // content falls back to the static sidebar width.
    const dashboardsRootStyle = resizableSidebar.canResize
        ? ({
              "--gd-dashboard-sidebar-width": `${resizableSidebar.width}px`,
          } as CSSProperties)
        : undefined;

    return (
        <IntlWrapper locale={locale}>
            <ToastsCenterContextProvider skipAutomaticMessageRendering>
                <OverlayControllerProvider overlayController={toastsOverlayController}>
                    <ToastsCenter />
                </OverlayControllerProvider>

                {/* we need wrapping element for drag layer and dashboard for proper rendering in flex layout */}
                <ResizableSidebarProvider value={resizableSidebar}>
                    <div
                        className={cx("component-root", {
                            "sdk-edit-mode-on": isEditMode,
                            "catalog-is-loaded": isCatalogLoaded,
                            "accessible-dashboards-loaded": accessibleDashboardsLoaded,
                        })}
                    >
                        <DragLayerComponent />
                        <div
                            className={cx("gd-dashboards-root gd-flex-container", {
                                "gd-dashboards-root--floating-toolbar": enableEnhancedInsightPicker,
                            })}
                            style={dashboardsRootStyle}
                        >
                            <DashboardSidebar
                                DefaultSidebar={RenderModeAwareDashboardSidebar}
                                DeleteDropZoneComponent={DeleteDropZone}
                                WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDrag}
                                WrapInsightListItemWithDragComponent={WrapInsightListItemWithDrag}
                            />
                            <main className={dashboardContentClassNames} {...mainContentNavigationProps}>
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
                                    {enableEnhancedInsightPicker ? <FilterDeleteOverlay /> : null}
                                </div>
                                <div className="gd-dash-bottom-position-pixel" ref={bottomRef} />
                            </main>
                        </div>
                        <Toolbar />
                    </div>
                </ResizableSidebarProvider>
            </ToastsCenterContextProvider>
        </IntlWrapper>
    );
}
