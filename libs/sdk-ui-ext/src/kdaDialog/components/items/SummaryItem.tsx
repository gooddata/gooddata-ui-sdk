// (C) 2025 GoodData Corporation

import { ReactNode, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiIconButton, UiListboxInteractiveItemProps } from "@gooddata/sdk-ui-kit";

import { useKdaState } from "../../providers/KdaState.js";

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
    const { state } = useKdaState();

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
                <div className={cx("gd-kda-item-summary-info")}>
                    <div className={cx("gd-kda-item-summary-info-text")}>
                        {intl.formatMessage(
                            { id: "kdaDialog.dialog.keyDrives.overview.summary.tests" },
                            {
                                combinations: state.combinations,
                            },
                        )}
                    </div>
                    <div className={cx("gd-kda-item-summary-info-divider")} />
                    <div className={cx("gd-kda-item-summary-info-text")}>
                        {intl.formatMessage(
                            { id: "kdaDialog.dialog.keyDrives.overview.summary.attributes" },
                            {
                                attributes: state.attributes,
                            },
                        )}
                    </div>
                </div>
            </div>
            <UiIconButton
                icon="pencil"
                variant="tertiary"
                label={intl.formatMessage({
                    id: "kdaDialog.dialog.keyDrives.overview.summary.drivers.edit_button",
                })}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            />
        </div>
    );
}
