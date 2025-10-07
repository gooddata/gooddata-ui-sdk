// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import { ShortenedText } from "../../../ShortenedText/index.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../listboxBem.js";
import { UiListboxInteractiveItemProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiListboxInteractiveItemComponent<T>({
    item,
    isFocused,
    isSelected,
    isCompact,
    onSelect,
}: UiListboxInteractiveItemProps<T>): ReactNode {
    return (
        <div
            className={e("item", {
                isFocused,
                isSelected,
                isCompact,
                isDisabled: !!item.isDisabled,
            })}
            onClick={item.isDisabled ? undefined : onSelect}
        >
            {item.icon ? <UiIcon type={item.icon} size={14} color="complementary-7" /> : null}
            <ShortenedText className={e("item-title")} ellipsisPosition={"end"}>
                {item.stringTitle}
            </ShortenedText>
            {item.tooltip ? (
                <UiTooltip
                    anchor={
                        <div className={e("item-explanation")}>
                            <UiIcon type="question" size={14} color="complementary-7" />
                        </div>
                    }
                    content={item.tooltip}
                    triggerBy={["hover", "focus"]}
                    arrowPlacement="left"
                    optimalPlacement
                    width={200}
                />
            ) : null}
        </div>
    );
}
