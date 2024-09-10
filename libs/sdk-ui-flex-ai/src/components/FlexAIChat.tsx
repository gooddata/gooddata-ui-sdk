// (C) 2024 GoodData Corporation
import React from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Provider as StoreProvider } from "react-redux";
import { useFlexAIStore } from "../hooks/useFlexAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { Message } from "../model.js";

/**
 * Properties for the FlexAIChat component.
 * @alpha
 */
export interface FlexAIChatProps {
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
 * UI component that renders the Flex AI chat.
 * @alpha
 */
export const FlexAIChat: React.FC<FlexAIChatProps> = ({ backend, workspace, history }) => {
    const flexAIStore = useFlexAIStore(backend, workspace, history);

    return (
        <IntlWrapper>
            <StoreProvider store={flexAIStore}>
                <div className="gd-flex-ai-chat">
                    <Messages />
                    <Input />
                    <Typography tagName="p" className="gd-flex-ai-chat__disclaimer">
                        We do not accept any liability for the generated information as it may not be accurate
                    </Typography>
                </div>
            </StoreProvider>
        </IntlWrapper>
    );
};
