// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantErrorMessage } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { FoundObjects } from "./FoundObjects.js";

type AssistantErrorMessageProps = {
    message: AssistantErrorMessage;
};

export const AssistantErrorMessageComponent: React.FC<AssistantErrorMessageProps> = ({ message }) => {
    return (
        <div className="gd-gen-ai-chat__messages__message gd-gen-ai-chat__messages__message--assistant gd-gen-ai-chat__messages__message--error">
            <AgentIcon error />
            <Typography tagName="p" className="gd-gen-ai-chat__messages__contents">
                {message.content.error}
            </Typography>

            {/* Search results */}
            <FoundObjects foundObjects={message.content.foundObjects} />
        </div>
    );
};
