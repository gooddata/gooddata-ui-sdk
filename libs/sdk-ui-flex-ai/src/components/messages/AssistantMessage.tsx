// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantMessage } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";

type AssistantMessageProps = {
    message: AssistantMessage;
};

export const AssistantMessageComponent: React.FC<AssistantMessageProps> = ({ message }) => {
    return (
        <div className="gd-flex-ai-chat__messages__message gd-flex-ai-chat__messages__message--assistant">
            <AgentIcon />
            <Typography tagName="p" className="gd-flex-ai-chat__messages__contents">
                {message.content}
            </Typography>
        </div>
    );
};
