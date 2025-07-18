// (C) 2022-2025 GoodData Corporation
import { LoadingDots } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

export function LoadingDashboardPlaceholderWidget() {
    return (
        <div className={cx("drag-info-placeholder", "dash-item", "type-loading")}>
            <LoadingDots />
        </div>
    );
}
