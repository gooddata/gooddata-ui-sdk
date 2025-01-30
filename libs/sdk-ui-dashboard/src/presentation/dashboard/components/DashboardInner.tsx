// (C) 2022-2025 GoodData Corporation
import React, { RefObject, useEffect, useRef } from "react";
import cx from "classnames";
import { IntlWrapper } from "../../localization/index.js";
import {
    useDashboardSelector,
    selectLocale,
    selectIsInEditMode,
    selectCatalogIsLoaded,
    useDashboardAutomations,
    selectEnableFlexibleLayout,
} from "../../../model/index.js";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader.js";
import { IDashboardProps } from "../types.js";
import { DashboardSidebar } from "../DashboardSidebar/DashboardSidebar.js";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar.js";
import {
    useDashboardDragScroll,
    DeleteDropZone,
    WrapInsightListItemWithDrag,
} from "../../dragAndDrop/index.js";
import { Toolbar } from "../../toolbar/index.js";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../constants/index.js";
import { DashboardContent } from "../DashboardContent.js";
import { DashboardScreenSizeProvider } from "./DashboardScreenSizeContext.js";
import { DragLayerComponent as FlexibleDragLayerComponent } from "../../flexibleLayout/dragAndDrop/DragLayer.js";
import { DragLayerComponent as FlexibleFluidDragLayerComponent } from "../../layout/dragAndDrop/DragLayer.js";
import { WrapCreatePanelItemWithDrag } from "../../dragAndDrop/WrapCreatePanelItemWithDrag.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export const DashboardInner: React.FC<IDashboardProps> = (props) => {
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);

    const headerRef = useRef(null);
    const layoutRef = useRef(null);
    const bottomRef = useRef(null);

    useDashboardDragScroll(layoutRef, headerRef, bottomRef);
    const { initializeAutomations } = useDashboardAutomations();

    useEffect(() => {
        initializeAutomations();
    }, [initializeAutomations]);

    const DragLayerComponent = isFlexibleLayoutEnabled
        ? FlexibleDragLayerComponent
        : FlexibleFluidDragLayerComponent;

    const mainContentNavigationConfig = props.keyboardNavigation?.mainContent;

    const mainContentNavigationProps = mainContentNavigationConfig
        ? {
              tabIndex: mainContentNavigationConfig.tabIndex,
              id: mainContentNavigationConfig.targetElementId,
          }
        : {};

    return (
        <IntlWrapper locale={locale}>
            {/* we need wrapping element for drag layer and dashboard for proper rendering in flex layout */}
            <div
                className={cx("component-root", {
                    "sdk-edit-mode-on": isEditMode,
                    "catalog-is-loaded": isCatalogLoaded,
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
                    <div className="gd-dash-content" {...mainContentNavigationProps}>
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
                            ref={layoutRef as RefObject<HTMLDivElement>}
                        >
                            <DashboardScreenSizeProvider>
                                <DashboardContent {...props} />
                            </DashboardScreenSizeProvider>
                        </div>
                        <div className="gd-dash-bottom-position-pixel" ref={bottomRef} />
                    </div>
                </div>
                <Toolbar />
            </div>
        </IntlWrapper>
    );
};
