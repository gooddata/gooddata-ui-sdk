// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type IUiListboxInteractiveItemProps } from "@gooddata/sdk-ui-kit";

import { type IKdaTrend } from "../../internalTypes.js";

export function TrendItem({
    item,
    onSelect,
    isSelected,
    isFocused,
}: IUiListboxInteractiveItemProps<{ trend: IKdaTrend; driver: number }>): ReactNode {
    return (
        <div
            className={cx("gd-kda-trend-item", {
                "gd-kda-trend-item-selected": isSelected,
                "gd-kda-trend-item-focused": isFocused,
            })}
            onClick={onSelect}
        >
            <div className={cx("gd-kda-trend-item-text")}>{item.stringTitle}</div>
            <div className={cx("gd-kda-trend-item-drivers")}>
                <FormattedMessage
                    id="kdaDialog.dialog.keyDrives.drivers"
                    values={{
                        count: item.data.driver,
                    }}
                />
            </div>
        </div>
    );
}
