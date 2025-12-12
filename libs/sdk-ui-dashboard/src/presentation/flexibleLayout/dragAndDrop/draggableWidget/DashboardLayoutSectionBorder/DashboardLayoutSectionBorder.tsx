// (C) 2019-2025 GoodData Corporation

import { type ReactNode } from "react";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorderLine.js";
import { type DashboardLayoutSectionBorderStatus } from "./types.js";

interface IDashboardLayoutSectionBorderProps {
    status: DashboardLayoutSectionBorderStatus;
    children?: ReactNode;
    renderBottomBorder?: boolean;
    itemSize?: IDashboardLayoutSizeByScreenSize; // optional so I don't need to handle this in old layout yet
}

export function DashboardLayoutSectionBorder({
    status,
    renderBottomBorder = true,
    children,
    itemSize,
}: IDashboardLayoutSectionBorderProps) {
    return (
        <>
            <DashboardLayoutSectionBorderLine position="top" status={status} itemSize={itemSize} />
            {children}
            {renderBottomBorder ? (
                <DashboardLayoutSectionBorderLine position="bottom" status={status} itemSize={itemSize} />
            ) : null}
        </>
    );
}
