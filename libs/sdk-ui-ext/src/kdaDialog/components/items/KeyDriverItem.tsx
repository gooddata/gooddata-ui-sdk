// (C) 2025 GoodData Corporation

import { CSSProperties, ReactNode } from "react";

import cx from "classnames";

import { UiIcon, UiListboxInteractiveItemProps } from "@gooddata/sdk-ui-kit";

import { KdaItem } from "../../internalTypes.js";

export function KeyDriverItem({
    maximum,
    item,
    onSelect,
    isSelected,
    isFocused,
}: UiListboxInteractiveItemProps<KdaItem> & { maximum: number }): ReactNode {
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
            {trend === "up" ? <UiIcon type="trendUp" size={16} color="complementary-5" /> : null}
            {trend === "down" ? <UiIcon type="trendDown" size={16} color="complementary-5" /> : null}
            <div className={cx("gd-kda-item-text")}>
                {item.data.title}: <strong>{item.data.category}</strong>
            </div>
            <div className={cx("gd-kda-item-value")}>
                {item.data.formatValue(item.data.to.value - item.data.from.value)}
            </div>
            <div
                className={cx("gd-kda-item-progress")}
                style={{ "--kda-item-width": width } as CSSProperties}
            />
        </div>
    );
}
