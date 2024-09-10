// (C) 2024 GoodData Corporation

import React from "react";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";

export const AgentState: React.FC = () => {
    return (
        <div className="gd-flex-ai-chat__agent_state">
            <AgentIcon loading />
            <Typography className="gd-flex-ai-chat__agent_state__status" tagName="p">
                Searching in existing analytics…
            </Typography>
        </div>
    );
};
