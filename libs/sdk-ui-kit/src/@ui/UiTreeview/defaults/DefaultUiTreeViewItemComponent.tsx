// (C) 2025 GoodData Corporation

import React from "react";

import { IUiTreeviewItemProps } from "../types.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { e } from "../treeviewBem.js";
import { ShortenedText } from "../../../ShortenedText/index.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export function DefaultUiTreeViewItemComponent<Level>({
    item,
    type,
    level,
    isExpanded,
    isFocused,
    isSelected,
    isCompact,
    onToggle,
    onSelect,
}: IUiTreeviewItemProps<Level>): React.ReactNode {
    return (
        <div
            style={defineVariables(level)}
            className={e("item", {
                isFocused,
                isSelected,
                isCompact,
                isExpanded,
                isDisabled: !!item.isDisabled,
            })}
            onClick={item.isDisabled ? undefined : onSelect}
        >
            {type === "group" ? (
                <div
                    className={e("item__item-arrow")}
                    onClick={(e) => {
                        onToggle(e, !isExpanded);
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                >
                    <UiIcon type="navigateRight" size={16} color="complementary-7" />
                </div>
            ) : null}
            {item.icon ? (
                <div className={e("item__item-icon")}>
                    <UiIcon type={item.icon} size={16} color="complementary-7" />
                </div>
            ) : null}
            <ShortenedText className={e("item__item-title")} ellipsisPosition={"end"}>
                {item.stringTitle}
            </ShortenedText>
            {item.tooltip ? (
                <UiTooltip
                    anchor={
                        <div className={e("item__item-explanation")}>
                            <UiIcon type="question" size={14} color="complementary-7" />
                        </div>
                    }
                    content={item.tooltip}
                    triggerBy={["hover", "focus"]}
                    arrowPlacement="left"
                    optimalPlacement={true}
                    width={200}
                />
            ) : null}
        </div>
    );
}

function defineVariables(level: number) {
    return { "--ui-treeview-item-level": level } as React.CSSProperties;
}
