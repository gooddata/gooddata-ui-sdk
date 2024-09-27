// (C) 2024 GoodData Corporation
import React from "react";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { ErrorBoundary } from "./ErrorBoundary.js";

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
export const GenAIChatWrapper: React.FC = () => {
    return (
        <ErrorBoundary>
            <div className="gd-gen-ai-chat">
                <Messages />
                <Input />
                <Typography tagName="p" className="gd-gen-ai-chat__disclaimer">
                    AI assistants can make mistakes. Check before relying on these answers.
                </Typography>
            </div>
        </ErrorBoundary>
    );
};
