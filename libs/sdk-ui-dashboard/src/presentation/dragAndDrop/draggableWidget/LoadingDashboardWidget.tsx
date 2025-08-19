// (C) 2022-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { LoadingDots } from "@gooddata/sdk-ui-kit";

export const LoadingDashboardPlaceholderWidget: React.FC = () => {
    return (
        <div className={cx("drag-info-placeholder", "dash-item", "type-loading")}>
            <LoadingDots />
        </div>
    );
};
