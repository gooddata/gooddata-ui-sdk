// (C) 2025 GoodData Corporation

import { ReactNode, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiIcon, UiListboxInteractiveItemProps } from "@gooddata/sdk-ui-kit";

export function SummaryItem({
    onSelect,
    isSelected,
    detailsId,
}: Omit<UiListboxInteractiveItemProps<undefined>, "item" | "isCompact" | "isFocused"> & {
    detailsId: string;
}): ReactNode {
    const intl = useIntl();
    const [isFocused, setFocused] = useState(false);
    const label = intl.formatMessage({ id: "kdaDialog.dialog.keyDrives.overview.summary.title" });

    return (
        <div
            tabIndex={0}
            role="button"
            aria-selected={isSelected}
            aria-controls={detailsId}
            className={cx("gd-kda-item-summary", {
                "gd-kda-item-summary-selected": isSelected,
                "gd-kda-item-summary-focused": isFocused,
            })}
            onClick={onSelect}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.currentTarget.click();
                }
            }}
        >
            <div>
                <div className={cx("gd-kda-item-summary-title")}>{label}</div>
            </div>
            <UiIcon type="navigateRight" size={16} />
        </div>
    );
}
