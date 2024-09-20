// (C) 2024 GoodData Corporation
import React from "react";
import { Provider as StoreProvider } from "react-redux";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { Message } from "../model.js";
import { GenAIChatOverlay } from "./GenAIChatOverlay.js";

export type GenAIChatDialogProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    history?: Message[];
    isOpen: boolean;
    onClose: () => void;
};

export const GenAIChatDialog: React.FC<GenAIChatDialogProps> = ({
    backend,
    workspace,
    history,
    isOpen,
    onClose,
}) => {
    const genAIStore = useGenAIStore(backend, workspace, history);

    if (!isOpen) return null;

    return (
        <IntlWrapper>
            <StoreProvider store={genAIStore}>
                <GenAIChatOverlay onClose={onClose} />
            </StoreProvider>
        </IntlWrapper>
    );
};
