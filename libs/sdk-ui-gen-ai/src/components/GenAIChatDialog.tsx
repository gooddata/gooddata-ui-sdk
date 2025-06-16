// (C) 2024-2025 GoodData Corporation
import React from "react";
import { Provider as StoreProvider } from "react-redux";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, useBackendStrict, useWorkspaceStrict, WorkspaceProvider } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider, useOverlayController } from "@gooddata/sdk-ui-kit";
import { CatalogItem, IColorPalette } from "@gooddata/sdk-model";

import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { ChatEventHandler } from "../store/events.js";
import { isOpenSelector, setOpenAction } from "../store/index.js";

import { GenAIChatOverlay } from "./GenAIChatOverlay.js";
import { ConfigProvider, LinkHandlerEvent } from "./ConfigContext.js";

export type GenAIChatDialogProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    isOpen: boolean;
    locale?: string;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    onClose: () => void;
    eventHandlers?: ChatEventHandler[];
    colorPalette?: IColorPalette;
    catalogItems?: CatalogItem[];
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => void;
};

// Default z-index:
// - High enough to be over other dialogs
// - Below chart tooltips
const DEFAULT_CHAT_Z_INDEX = 3000;

export const GenAIChatDialog: React.FC<GenAIChatDialogProps> = ({
    backend,
    workspace,
    locale,
    isOpen,
    onClose,
    canManage = false,
    canAnalyze = false,
    canFullControl = false,
    eventHandlers,
    catalogItems,
    colorPalette,
    onLinkClick,
}) => {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, {
        eventHandlers,
        colorPalette,
    });

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
        <IntlWrapper locale={locale}>
            <StoreProvider store={genAIStore}>
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <OverlayControllerProvider overlayController={chatOverlayController}>
                            <ConfigProvider
                                allowNativeLinks={true}
                                linkHandler={onLinkClick}
                                catalogItems={catalogItems}
                                canManage={canManage}
                                canAnalyze={canAnalyze}
                                canFullControl={canFullControl}
                            >
                                <GenAIChatOverlay onClose={onClose} />
                            </ConfigProvider>
                        </OverlayControllerProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
};
