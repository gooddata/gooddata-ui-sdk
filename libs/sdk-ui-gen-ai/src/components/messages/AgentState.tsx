// (C) 2024 GoodData Corporation

import React from "react";
import { AgentIcon } from "./AgentIcon.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

export const AgentState: React.FC = () => {
    return (
        <div className="gd-gen-ai-chat__agent_state">
            <AgentIcon loading />
            <Typography className="gd-gen-ai-chat__agent_state__status" tagName="p">
                <FormattedMessage id="gd.gen-ai.state.in-progress" />
            </Typography>
        </div>
    );
};
