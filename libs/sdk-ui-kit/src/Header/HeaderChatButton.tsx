// (C) 2007-2025 GoodData Corporation

import React from "react";
import cx from "classnames";
import { Icon } from "../Icon/index.js";
import { Button } from "../Button/index.js";

type HeaderChatButtonProps = {
    onClick: (e: React.MouseEvent) => void;
};

export const HeaderChatButton: React.FC<HeaderChatButtonProps> = ({ onClick }) => {
    const classNames = cx("gd-header-measure", "gd-header-button", "gd-header-chat");

    // The text is not l18n-ed because it is not final
    return (
        <Button title="Open AI Assistant" className={classNames} onClick={onClick}>
            <Icon.GenAI width={32} height={32} ariaHidden />
        </Button>
    );
};
