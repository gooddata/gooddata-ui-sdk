// (C) 2022 GoodData Corporation
import { LoadingDots } from "@gooddata/sdk-ui-kit";
import cx from "classnames";
import React from "react";

export const LoadingDashboardPlaceholderWidget: React.FC = () => {
    return (
        <div className={cx("drag-info-placeholder", "dash-item", "type-loading")}>
            <LoadingDots />
        </div>
    );
};
