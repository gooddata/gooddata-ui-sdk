// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantTextMessage } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";

type AssistantTextMessageProps = {
    message: AssistantTextMessage;
};

export const AssistantTextMessageComponent: React.FC<AssistantTextMessageProps> = ({ message }) => {
    return (
        <div className="gd-gen-ai-chat__messages__message gd-gen-ai-chat__messages__message--assistant">
            <AgentIcon />
            <Typography tagName="p" className="gd-gen-ai-chat__messages__contents">
                {message.content.text}
            </Typography>
        </div>
    );
};
