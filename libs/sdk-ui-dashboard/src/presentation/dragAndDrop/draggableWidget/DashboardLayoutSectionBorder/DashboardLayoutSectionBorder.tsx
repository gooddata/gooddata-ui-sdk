// (C) 2019-2022 GoodData Corporation
import React from "react";

import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorderLine";
import { DashboardLayoutSectionBorderStatus } from "./types";

interface IDashboardLayoutSectionBorderProps {
    status: DashboardLayoutSectionBorderStatus;
}

export const DashboardLayoutSectionBorder: React.FC<IDashboardLayoutSectionBorderProps> = (props) => (
    <>
        <DashboardLayoutSectionBorderLine position="top" status={props.status} />
        {props.children}
        <DashboardLayoutSectionBorderLine position="bottom" status={props.status} />
    </>
);
