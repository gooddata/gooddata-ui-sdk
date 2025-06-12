// (C) 2019-2024 GoodData Corporation
import React from "react";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { DashboardLayoutSectionBorderLine } from "./DashboardLayoutSectionBorderLine.js";
import { DashboardLayoutSectionBorderStatus } from "./types.js";

interface IDashboardLayoutSectionBorderProps {
    status: DashboardLayoutSectionBorderStatus;
    children?: React.ReactNode;
    renderBottomBorder?: boolean;
    itemSize?: IDashboardLayoutSizeByScreenSize; // optional so I don't need to handle this in old layout yet
}

export const DashboardLayoutSectionBorder: React.FC<IDashboardLayoutSectionBorderProps> = ({
    status,
    renderBottomBorder = true,
    children,
    itemSize,
}) => (
    <>
        <DashboardLayoutSectionBorderLine position="top" status={status} itemSize={itemSize} />
        {children}
        {renderBottomBorder ? (
            <DashboardLayoutSectionBorderLine position="bottom" status={status} itemSize={itemSize} />
        ) : null}
    </>
);
