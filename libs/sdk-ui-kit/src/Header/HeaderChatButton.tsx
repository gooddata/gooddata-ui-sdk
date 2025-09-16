// (C) 2007-2025 GoodData Corporation

import { MouseEvent } from "react";

import cx from "classnames";

import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";

type HeaderChatButtonProps = {
    title?: string;
    color?: string;
    onClick: (e: MouseEvent) => void;
};

export function HeaderChatButton({ color, title, onClick }: HeaderChatButtonProps) {
    const classNames = cx("gd-header-measure", "gd-header-button", "gd-header-chat");
    const GenAIIcon = Icon["GenAI"];
    // The text is not l18n-ed because it is not final
    return (
        <Button
            title={title}
            className={classNames}
            onClick={onClick}
            accessibilityConfig={{
                ariaLabel: title,
            }}
        >
            <GenAIIcon color={color} width={32} height={32} ariaHidden />
        </Button>
    );
}
