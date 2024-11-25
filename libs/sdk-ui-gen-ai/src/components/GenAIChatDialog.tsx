// (C) 2024 GoodData Corporation
import React from "react";
import { Provider as StoreProvider } from "react-redux";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, useBackendStrict, useWorkspaceStrict, WorkspaceProvider } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider, useOverlayController } from "@gooddata/sdk-ui-kit";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { GenAIChatOverlay } from "./GenAIChatOverlay.js";
import { ChatEventHandler } from "../store/events.js";
import { isOpenSelector, setOpenAction } from "../store/index.js";

export type GenAIChatDialogProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    isOpen: boolean;
    onClose: () => void;
    eventHandlers?: ChatEventHandler[];
};

// To render the overlay on top of the header, we need to start at 6000
const DEFAULT_CHAT_Z_INDEX = 6000;

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

    // Some apps, like Dashboards, already have an overlay controller, so we need to use that one
    const parentOverlayController = useOverlayController();
    const chatOverlayController = React.useMemo(
        () => parentOverlayController ?? OverlayController.getInstance(DEFAULT_CHAT_Z_INDEX),
        [parentOverlayController],
    );

    if (!isOpen) return null;

    return (
        <IntlWrapper>
            <StoreProvider store={genAIStore}>
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <OverlayControllerProvider overlayController={chatOverlayController}>
                            <GenAIChatOverlay onClose={onClose} />
                        </OverlayControllerProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
};
