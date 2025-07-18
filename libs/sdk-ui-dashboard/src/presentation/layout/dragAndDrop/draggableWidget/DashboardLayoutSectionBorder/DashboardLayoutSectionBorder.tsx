// (C) 2019-2025 GoodData Corporation
import { ReactNode } from "react";
import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorderLine.js";
import { DashboardLayoutSectionBorderStatus } from "./types.js";

interface IDashboardLayoutSectionBorderProps {
    status: DashboardLayoutSectionBorderStatus;
    children?: ReactNode;
}

export function DashboardLayoutSectionBorder(props: IDashboardLayoutSectionBorderProps) {
    return (
        <>
            <DashboardLayoutSectionBorderLine position="top" status={props.status} />
            {props.children}
            <DashboardLayoutSectionBorderLine position="bottom" status={props.status} />
        </>
    );
}
