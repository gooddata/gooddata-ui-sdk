// (C) 2007-2026 GoodData Corporation

import { type CSSProperties, type MouseEvent, useLayoutEffect, useRef } from "react";

import cx from "classnames";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { UiTooltip } from "../@ui/UiTooltip/UiTooltip.js";
import { Button } from "../Button/Button.js";
import { isFocusLost } from "../utils/domUtilities.js";

type HeaderChatButtonProps = {
    title?: string;
    isOpen?: boolean;
    onClick: (e: MouseEvent) => void;
};

/**
 * @internal
 */
export const HEADER_CHAT_BUTTON_ID = "gd-header-chat-button";

/**
 * Id of the assistant panel this button opens. Set on the chat dialog so the button can reference it
 * through aria-controls.
 *
 * @internal
 */
export const HEADER_CHAT_PANEL_ID = "gd-header-chat-panel";

const HEADER_CHAT_TOOLTIP_DELAY = 400;
// Keeps the button stretched to the header height inside the tooltip anchor wrapper.
const TOOLTIP_ANCHOR_STYLES: CSSProperties = { display: "flex", height: "100%" };

export function HeaderChatButton({ title, isOpen = false, onClick }: HeaderChatButtonProps) {
    const buttonRef = useRef<HTMLElement>(null);
    const wasOpenRef = useRef(isOpen);

    // When the panel closes and takes the focus with it (e.g. Escape or its close button), return
    // the focus here. Done in the same commit that renders aria-expanded="false", so screen readers
    // announce the button as collapsed the moment it gets the focus, never with the stale state.
    useLayoutEffect(() => {
        const wasOpen = wasOpenRef.current;
        wasOpenRef.current = isOpen;
        if (wasOpen && !isOpen && isFocusLost()) {
            buttonRef.current?.focus();
        }
    }, [isOpen]);

    const classNames = cx("gd-header-measure", "gd-header-button", "gd-header-chat");
    // The tooltip is visual only, not a native title: a title equal to the aria-label would be
    // exposed as the accessible description and screen readers would read the name twice.
    // It opens on hover and on keyboard focus, and stays open while the pointer is over it.
    return (
        <UiTooltip
            anchor={
                <Button
                    ref={buttonRef}
                    id={HEADER_CHAT_BUTTON_ID}
                    className={classNames}
                    onClick={onClick}
                    accessibilityConfig={{
                        ariaLabel: title,
                        ariaHaspopup: "dialog",
                        ariaExpanded: isOpen,
                        // The panel is mounted only while open, so reference it only then.
                        ariaControls: isOpen ? HEADER_CHAT_PANEL_ID : undefined,
                    }}
                >
                    <UiIcon type="genai" size={16} />
                </Button>
            }
            content={title}
            triggerBy={["hover", "focus"]}
            hoverOpenDelay={HEADER_CHAT_TOOLTIP_DELAY}
            arrowPlacement="top"
            optimalPlacement
            accessibilityHidden
            disabled={!title || isOpen}
            anchorWrapperStyles={TOOLTIP_ANCHOR_STYLES}
        />
    );
}
