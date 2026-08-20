// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { ShortenedText } from "../../../ShortenedText/ShortenedText.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../listboxBem.js";
import { type IUiListboxInteractiveItemProps } from "../types.js";

/**
 * @internal
 */
export function DefaultUiListboxInteractiveItemComponent<T>({
    item,
    isFocused,
    isSelected,
    isCompact,
    onSelect,
}: IUiListboxInteractiveItemProps<T>): ReactNode {
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
                <>
                    <UiTooltip
                        anchor={
                            <div className={e("item-explanation")}>
                                <UiIcon type="question" size={14} color="complementary-7" />
                            </div>
                        }
                        content={item.tooltip}
                        triggerBy={["hover"]}
                        accessibilityHidden
                        arrowPlacement="left"
                        optimalPlacement
                        width={200}
                        offset={10}
                    />
                    {/* the option is never DOM-focused (the listbox drives aria-activedescendant),
                        so the tooltip text rides along inside the option's content for screen
                        readers instead of a describedby/focusable-anchor wiring */}
                    <span className="sr-only">{item.tooltip}</span>
                </>
            ) : null}
        </div>
    );
}
