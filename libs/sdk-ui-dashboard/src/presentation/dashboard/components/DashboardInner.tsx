// (C) 2022-2024 GoodData Corporation
import React, { RefObject, useRef } from "react";
import cx from "classnames";
import { IntlWrapper } from "../../localization/index.js";
import { useDashboardSelector, selectLocale, selectIsInEditMode } from "../../../model/index.js";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader.js";
import { IDashboardProps } from "../types.js";
import { DashboardSidebar } from "../DashboardSidebar/DashboardSidebar.js";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar.js";
import {
    DragLayerComponent,
    useDashboardDragScroll,
    DeleteDropZone,
    WrapCreatePanelItemWithDrag,
    WrapInsightListItemWithDrag,
} from "../../dragAndDrop/index.js";
import { Toolbar } from "../../toolbar/index.js";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../constants/index.js";
import { DashboardContent } from "../DashboardContent.js";
import { GRID_COLUMNS_COUNT } from "../../layout/DefaultDashboardLayoutRenderer/constants.js";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

const GRID_RULERS = new Array(GRID_COLUMNS_COUNT).fill(0).map((_, i) => i + 1);
const styles = { padding: 20 };

export const DashboardInner: React.FC<IDashboardProps> = (props) => {
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    const headerRef = useRef(null);
    const layoutRef = useRef(null);
    const bottomRef = useRef(null);

    useDashboardDragScroll(layoutRef, headerRef, bottomRef);

    return (
        <IntlWrapper locale={locale}>
            {/* we need wrapping element for drag layer and dashboard for proper rendering in flex layout */}
            <div
                className={cx("component-root", {
                    "sdk-edit-mode-on": isEditMode,
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
                    <div className="gd-dash-content">
                        {/* gd-dash-header-wrapper-sdk-8-12 style is added because we should keep old styles unchanged to not brake plugins */}
                        <div
                            className="gd-dash-header-wrapper gd-dash-header-wrapper-sdk-8-12"
                            ref={headerRef}
                        >
                            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
                            <OverlayControllerProvider overlayController={overlayController}>
                                <DashboardHeader />
                                <div
                                    style={styles}
                                    className="gd-grid-layout__container gd-grid-layout__item--container--ruler"
                                >
                                    {GRID_RULERS.map((value) => (
                                        <div
                                            key={value}
                                            className="gd-grid-layout__item gd-grid-layout__item--ruler"
                                        >
                                            {value}
                                        </div>
                                    ))}
                                </div>
                            </OverlayControllerProvider>
                        </div>
                        <div
                            className="gd-flex-item-stretch dash-section dash-section-kpis"
                            ref={layoutRef as RefObject<HTMLDivElement>}
                        >
                            <DashboardContent {...props} />
                        </div>
                        <div className="gd-dash-bottom-position-pixel" ref={bottomRef} />
                    </div>
                </div>
                <Toolbar />
            </div>
        </IntlWrapper>
    );
};
