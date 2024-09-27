// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantCancelledMessage } from "../../model.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { AgentIcon } from "./AgentIcon.js";
import { FormattedMessage } from "react-intl";

type AssistantCancelledMessageProps = {
    message: AssistantCancelledMessage;
};

export const AssistantCancelledMessageComponent: React.FC<AssistantCancelledMessageProps> = () => {
    return (
        <div className="gd-gen-ai-chat__messages__message gd-gen-ai-chat__messages__message--assistant gd-gen-ai-chat__messages__message--assistant--cancelled">
            <AgentIcon cancelled />
            <Typography tagName="p" className="gd-gen-ai-chat__messages__contents">
                <FormattedMessage id="gd.gen-ai.state.cancelled" />
            </Typography>
        </div>
    );
};
