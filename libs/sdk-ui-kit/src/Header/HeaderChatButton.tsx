// (C) 2007-2026 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { Button } from "../Button/Button.js";

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

export function HeaderChatButton({ title, isOpen = false, onClick }: HeaderChatButtonProps) {
    const classNames = cx("gd-header-measure", "gd-header-button", "gd-header-chat");
    // The text is not l18n-ed because it is not final
    return (
        <Button
            id={HEADER_CHAT_BUTTON_ID}
            title={title}
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
    );
}
