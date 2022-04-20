// (C) 2022 GoodData Corporation
import React from "react";
import { IntlWrapper } from "../../localization";
import { useDashboardSelector, selectLocale } from "../../../model";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader";
import { IDashboardProps } from "../types";
import { DashboardMainContent } from "./DashboardMainContent";

export const DashboardInner: React.FC<IDashboardProps> = () => {
    const locale = useDashboardSelector(selectLocale);

    return (
        <IntlWrapper locale={locale}>
            <div className="gd-dashboards-root">
                <div className="gd-dash-header-wrapper">
                    <DashboardHeader />
                </div>
                <DashboardMainContent />
            </div>
        </IntlWrapper>
    );
};
