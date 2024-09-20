// (C) 2024 GoodData Corporation

import React from "react";
import { AssistantSearchCreateMessage } from "../../model.js";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { Visualization } from "./Visualization.js";
import { useWorkspace } from "@gooddata/sdk-ui";

type AssistantSearchCreateMessageProps = {
    message: AssistantSearchCreateMessage;
};

export const AssistantSearchCreateMessageComponent: React.FC<AssistantSearchCreateMessageProps> = ({
    message,
}) => {
    const firstVisualization = message.content.createdVisualizations?.objects?.[0];
    const first5FoundObjects = message.content.foundObjects
        ?.filter((obj) => obj.type === "visualization")
        .slice(0, 5);
    const workspace = useWorkspace();

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
                {first5FoundObjects ? (
                    <Typography tagName="p">
                        I have found the following relevant visualizations:
                        <ul>
                            {first5FoundObjects.map((vis) => (
                                <li key={vis.id}>
                                    <a
                                        href={`/analyze/#/${workspace}/${vis.id}/edit`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {vis.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Typography>
                ) : null}
            </div>
        </div>
    );
};
