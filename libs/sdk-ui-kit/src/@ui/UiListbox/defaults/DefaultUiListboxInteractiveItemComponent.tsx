// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { useIsTextTruncated } from "../../hooks/useIsTextTruncated.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../listboxBem.js";
import { type IUiListboxInteractiveItemProps } from "../types.js";

// The tooltip anchor wrapper defaults to fit-content; the title must be allowed to shrink and clip.
const TITLE_ANCHOR_STYLE = { display: "block", minWidth: 0, flex: "1 1 0%" } as const;

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
    const title = useIsTextTruncated(item.stringTitle);
    const titleElement = (
        <span ref={title.ref} className={e("item-title")}>
            {item.stringTitle}
        </span>
    );

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
            {title.isTruncated ? (
                <UiTooltip
                    anchor={titleElement}
                    content={item.stringTitle}
                    triggerBy={["hover"]}
                    accessibilityHidden
                    arrowPlacement="left"
                    optimalPlacement
                    offset={10}
                    component="span"
                    anchorWrapperStyles={TITLE_ANCHOR_STYLE}
                />
            ) : (
                titleElement
            )}
            {item.tooltip ? (
                <>
                    <UiTooltip
                        anchor={
                            <div className={e("item-explanation")}>
                                <UiIcon type="question" size={14} color="complementary-7" />
                            </div>
                        }
                        content={item.tooltipContent ?? item.tooltip}
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
