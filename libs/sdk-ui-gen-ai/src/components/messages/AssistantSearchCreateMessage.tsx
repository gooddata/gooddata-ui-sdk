// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantSearchCreateMessage } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { Visualization } from "./Visualization.js";

type AssistantSearchCreateMessageProps = {
    message: AssistantSearchCreateMessage;
};

export const AssistantSearchCreateMessageComponent: React.FC<AssistantSearchCreateMessageProps> = ({
    message,
}) => {
    const firstVisualization = message.content.createdVisualizations?.objects?.[0];

    return (
        <div className="gd-gen-ai-chat__messages__message gd-gen-ai-chat__messages__message--assistant">
            <AgentIcon />

            <div className="gd-gen-ai-chat__messages__contents">
                {/* Explanation */}
                {message.content.createdVisualizations?.reasoning ? (
                    <Typography tagName="p">{message.content.createdVisualizations.reasoning}</Typography>
                ) : null}

                {/* Visualization */}
                {firstVisualization ? <Visualization definition={firstVisualization} /> : null}

                {/* Search results */}
            </div>
        </div>
    );
};
