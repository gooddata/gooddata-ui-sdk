// (C) 2024 GoodData Corporation

import React from "react";
import { UserMessage } from "../../model.js";
import { Typography } from "@gooddata/sdk-ui-kit";

type UserMessageProps = {
    message: UserMessage;
};

export const UserMessageComponent: React.FC<UserMessageProps> = ({ message }) => {
    return (
        <div className="gd-flex-ai-chat__messages__message gd-flex-ai-chat__messages__message--user">
            <Typography tagName="p" className="gd-flex-ai-chat__messages__message__contents">
                {message.content}
            </Typography>
        </div>
    );
};
