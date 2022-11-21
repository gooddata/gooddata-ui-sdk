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
                        <div className="gd-dash-header-wrapper">
                            <DashboardHeader />
                        </div>
                        <DashboardMainContent />
                    </div>
                </div>
            </div>
        </IntlWrapper>
    );
};
