// (C) 2024 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Provider as StoreProvider } from "react-redux";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { Message } from "../model.js";

/**
 * Properties for the GenAIChat component.
 * @alpha
 */
export interface GenAIChatProps {
    /**
     * Analytical backend to use for server communication.
     */
    backend?: IAnalyticalBackend;
    /**
     * The workspace ID the user is working with.
     */
    workspace?: string;
    /**
     * A conversation history in case you're resuming the chat.
     */
    history?: Message[];
}

/**
 * UI component that renders the Gen AI chat.
 * @alpha
 */
export const GenAIChat: React.FC<GenAIChatProps> = ({ backend, workspace, history }) => {
    const genAIStore = useGenAIStore(backend, workspace, history);

    return (
        <IntlWrapper>
            <StoreProvider store={genAIStore}>
                <div className="gd-gen-ai-chat">
                    <Messages />
                    <Input />
                    <Typography tagName="p" className="gd-gen-ai-chat__disclaimer">
                        We do not accept any liability for the generated information as it may not be accurate
                    </Typography>
                </div>
            </StoreProvider>
        </IntlWrapper>
    );
};
