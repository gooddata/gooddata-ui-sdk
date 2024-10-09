// (C) 2024 GoodData Corporation

import React from "react";
import cx from "classnames";
import { UserMessage } from "../../model.js";
import { MessageContents } from "./MessageContents.js";

type UserMessageProps = {
    message: UserMessage;
};

export const UserMessageComponent: React.FC<UserMessageProps> = ({ message }) => {
    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--user",
        message.cancelled && "gd-gen-ai-chat__messages__message--cancelled",
    );

    return (
        <div className={classNames}>
            <MessageContents content={message.content} />
        </div>
    );
};
