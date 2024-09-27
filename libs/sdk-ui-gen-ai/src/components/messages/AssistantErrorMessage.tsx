// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantErrorMessage } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { FoundObjects } from "./FoundObjects.js";
import { injectIntl, WrappedComponentProps } from "react-intl";

type AssistantErrorMessageProps = {
    message: AssistantErrorMessage;
};

const AssistantErrorMessageInnerComponent: React.FC<AssistantErrorMessageProps & WrappedComponentProps> = ({
    message,
    intl,
}) => {
    return (
        <div className="gd-gen-ai-chat__messages__message gd-gen-ai-chat__messages__message--assistant gd-gen-ai-chat__messages__message--error">
            <AgentIcon error />
            <Typography tagName="p" className="gd-gen-ai-chat__messages__contents">
                {message.content.error ?? intl.formatMessage({ id: "gd.gen-ai.invalid-question" })}
            </Typography>

            {/* Search results */}
            <FoundObjects foundObjects={message.content.foundObjects} />
        </div>
    );
};

export const AssistantErrorMessageComponent = injectIntl(AssistantErrorMessageInnerComponent);
