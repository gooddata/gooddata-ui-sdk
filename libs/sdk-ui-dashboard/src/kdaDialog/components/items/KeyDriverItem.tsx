// (C) 2025-2026 GoodData Corporation

import { type CSSProperties, type ReactNode } from "react";

import cx from "classnames";

import { type IUiListboxInteractiveItemProps } from "@gooddata/sdk-ui-kit";

import { type IKdaItem } from "../../internalTypes.js";

export function KeyDriverItem({
    maximum,
    item,
    onSelect,
    isSelected,
    isFocused,
}: IUiListboxInteractiveItemProps<IKdaItem> & { maximum: number }): ReactNode {
    const trend = item.data.from.value < item.data.to.value ? "up" : "down";
    const width = `${(Math.abs(item.data.to.value - item.data.from.value) / maximum) * 100}%`;

    return (
        <div
            className={cx("gd-kda-item", {
                "gd-kda-item-selected": isSelected,
                "gd-kda-item-focused": isFocused,
            })}
            onClick={onSelect}
        >
            <div className={cx("gd-kda-item-text")}>
                <div className="gd-kda-item-text-title">{item.data.title}</div>
                <div className="gd-kda-item-text-category">{item.data.category}</div>
            </div>
            <div className={cx("gd-kda-item-value")}>
                {trend === "up" ? "+" : ""}
                {item.data.formatValue(item.data.to.value - item.data.from.value)}
            </div>
            <div
                className={cx("gd-kda-item-progress")}
                style={{ "--kda-item-width": width } as CSSProperties}
            />
        </div>
    );
}
