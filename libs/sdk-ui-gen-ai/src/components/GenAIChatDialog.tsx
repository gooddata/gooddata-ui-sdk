// (C) 2024 GoodData Corporation
import React from "react";
import { Provider as StoreProvider } from "react-redux";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { GenAIChatOverlay } from "./GenAIChatOverlay.js";
import { BackendProvider, useBackendStrict, useWorkspaceStrict, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ChatEventHandler } from "../store/events.js";
import { isOpenSelector, setOpenAction } from "../store/index.js";

export type GenAIChatDialogProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    isOpen: boolean;
    onClose: () => void;
    eventHandlers?: ChatEventHandler[];
};

export const GenAIChatDialog: React.FC<GenAIChatDialogProps> = ({
    backend,
    workspace,
    isOpen,
    onClose,
    eventHandlers,
}) => {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, eventHandlers);

    React.useEffect(() => {
        // Save the open state into the store
        const storeIsOpen = isOpenSelector(genAIStore.getState());

        if (storeIsOpen !== isOpen) {
            genAIStore.dispatch(setOpenAction({ isOpen }));
        }
    }, [genAIStore, isOpen]);

    if (!isOpen) return null;

    return (
        <IntlWrapper>
            <StoreProvider store={genAIStore}>
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <GenAIChatOverlay onClose={onClose} />
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
};
