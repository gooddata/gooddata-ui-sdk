// (C) 2024 GoodData Corporation
import React from "react";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { Typography } from "@gooddata/sdk-ui-kit";

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
export const GenAIChatWrapper: React.FC = () => {
    return (
        <div className="gd-gen-ai-chat">
            <Messages />
            <Input />
            <Typography tagName="p" className="gd-gen-ai-chat__disclaimer">
                We do not accept any liability for the generated information as it may not be accurate
            </Typography>
        </div>
    );
};
