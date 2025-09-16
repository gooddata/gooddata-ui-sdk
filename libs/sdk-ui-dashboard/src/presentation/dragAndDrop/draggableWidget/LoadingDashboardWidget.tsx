// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { LoadingDots } from "@gooddata/sdk-ui-kit";

export function LoadingDashboardPlaceholderWidget() {
    return (
        <div className={cx("drag-info-placeholder", "dash-item", "type-loading")}>
            <LoadingDots />
        </div>
    );
}
