// (C) 2019-2022 GoodData Corporation
import React from "react";

import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorderLine.js";
import { DashboardLayoutSectionBorderStatus } from "./types.js";

interface IDashboardLayoutSectionBorderProps {
    status: DashboardLayoutSectionBorderStatus;
    children?: React.ReactNode;
}

export const DashboardLayoutSectionBorder: React.FC<IDashboardLayoutSectionBorderProps> = (props) => (
    <>
        <DashboardLayoutSectionBorderLine position="top" status={props.status} />
        {props.children}
        <DashboardLayoutSectionBorderLine position="bottom" status={props.status} />
    </>
);
