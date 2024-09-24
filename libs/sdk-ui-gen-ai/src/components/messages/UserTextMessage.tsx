// (C) 2024 GoodData Corporation

import React from "react";
import { UserTextMessage } from "../../model.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

type UserTextMessageProps = {
    message: UserTextMessage;
};

export const UserTextMessageComponent: React.FC<UserTextMessageProps> = ({ message }) => {
    const classNames = cx(
        "gd-gen-ai-chat__messages__message",
        "gd-gen-ai-chat__messages__message--user",
        message.content.cancelled && "gd-gen-ai-chat__messages__message--user--cancelled",
    );

    return (
        <div className={classNames}>
            <Typography tagName="p" className="gd-gen-ai-chat__messages__contents">
                {message.content.text}
            </Typography>
        </div>
    );
};
