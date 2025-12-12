// (C) 2007-2025 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { Button } from "../Button/index.js";

type HeaderChatButtonProps = {
    title?: string;
    onClick: (e: MouseEvent) => void;
};

/**
 * @internal
 */
export const HEADER_CHAT_BUTTON_ID = "gd-header-chat-button";

export function HeaderChatButton({ title, onClick }: HeaderChatButtonProps) {
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
            }}
        >
            <UiIcon type="genai" size={16} ariaHidden />
        </Button>
    );
}
