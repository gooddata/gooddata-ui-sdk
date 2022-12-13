// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IntlWrapper } from "../../localization";
import { useDashboardSelector, selectLocale, selectIsInEditMode } from "../../../model";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader";
import { IDashboardProps } from "../types";
import { DashboardMainContent } from "./DashboardMainContent";
import { DashboardSidebar } from "../DashboardSidebar/DashboardSidebar";
import { RenderModeAwareDashboardSidebar } from "../DashboardSidebar/RenderModeAwareDashboardSidebar";
import { DragLayerComponent } from "../../dragAndDrop";
import { Toolbar } from "../../toolbar";
import { OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../constants";

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export const DashboardInner: React.FC<IDashboardProps> = () => {
    const locale = useDashboardSelector(selectLocale);
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    return (
        <IntlWrapper locale={locale}>
            {/* we need wrapping element for drag layer and dashboard for proper rendering in flex layout */}
            <div className="component-root">
                <DragLayerComponent />
                <div
                    className={cx("gd-dashboards-root", "gd-flex-container", {
                        "sdk-edit-mode-on": isEditMode,
                    })}
                >
                    <DashboardSidebar DefaultSidebar={RenderModeAwareDashboardSidebar} />
                    <div className="gd-dash-content">
                        {/* gd-dash-header-wrapper-sdk-8-12 style is added because we should keep old styles unchanged to not brake plugins */}
                        <div className="gd-dash-header-wrapper gd-dash-header-wrapper-sdk-8-12">
                            {/* Header z-index start at  6000 so we need force all overlays z-indexes start at 6000 to be under header */}
                            <OverlayControllerProvider overlayController={overlayController}>
                                <DashboardHeader />
                            </OverlayControllerProvider>
                        </div>
                        <DashboardMainContent />
                    </div>
                </div>
                <Toolbar />
            </div>
        </IntlWrapper>
    );
};
