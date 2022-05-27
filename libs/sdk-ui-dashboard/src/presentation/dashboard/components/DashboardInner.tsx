// (C) 2022 GoodData Corporation
import React from "react";
import { IntlWrapper } from "../../localization";
import { useDashboardSelector, selectLocale } from "../../../model";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader";
import { IDashboardProps } from "../types";
import { DashboardMainContent } from "./DashboardMainContent";
import { DashboardSidebar } from "../DashboardSidebar/DashboardSidebar";
import { RenderModeAwareDashboardLayoutSectionHeaderRenderer } from "../DashboardSidebar/RenderModeAwareDashboardSidebar";

export const DashboardInner: React.FC<IDashboardProps> = () => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root gd-flex-container">
                <DashboardSidebar DefaultSidebar={RenderModeAwareDashboardLayoutSectionHeaderRenderer} />
                <div className="gd-dash-content">
                    <div className="gd-dash-header-wrapper">
                        <DashboardHeader />
                    </div>
                    <DashboardMainContent />
                </div>
            </div>
        </IntlWrapper>
    );
};
