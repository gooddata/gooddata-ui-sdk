// (C) 2024 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Provider as StoreProvider } from "react-redux";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { Message } from "../model.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";

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
                <GenAIChatWrapper />
            </StoreProvider>
        </IntlWrapper>
    );
};
