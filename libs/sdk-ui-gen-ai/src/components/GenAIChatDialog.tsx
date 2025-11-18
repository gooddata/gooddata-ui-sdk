// (C) 2024-2025 GoodData Corporation

import { ComponentType, RefObject, useEffect, useMemo } from "react";

import { EnhancedStore } from "@reduxjs/toolkit";
import { Provider as StoreProvider } from "react-redux";

import { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { CatalogItem, IColorPalette } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider, useOverlayController } from "@gooddata/sdk-ui-kit";

import { ConfigProvider, LinkHandlerEvent } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import { GenAIChatOverlay } from "./GenAIChatOverlay.js";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { ChatEventHandler } from "../store/events.js";
import { isOpenSelector, setOpenAction } from "../store/index.js";

export type GenAIChatDialogProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    isOpen: boolean;
    locale?: string;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    settings?: IUserWorkspaceSettings;
    onClose: () => void;
    eventHandlers?: ChatEventHandler[];
    colorPalette?: IColorPalette;
    catalogItems?: CatalogItem[];
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => void;
    onDispatcher?: (dispatch: EnhancedStore["dispatch"]) => void;
    LandingScreenComponentProvider?: () => ComponentType;
};

// Default z-index:
// - High enough to be over other dialogs
// - Below chart tooltips
const DEFAULT_CHAT_Z_INDEX = 3000;

export function GenAIChatDialog({
    backend,
    workspace,
    locale,
    isOpen,
    onClose,
    settings,
    returnFocusTo,
    canManage = false,
    canAnalyze = false,
    canFullControl = false,
    eventHandlers,
    catalogItems,
    colorPalette,
    onLinkClick,
    onDispatcher,
    LandingScreenComponentProvider,
}: GenAIChatDialogProps) {
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, {
        eventHandlers,
        colorPalette,
        settings,
    });

    useEffect(() => {
        // Save the open state into the store
        const storeIsOpen = isOpenSelector(genAIStore.getState());

        if (storeIsOpen !== isOpen) {
            genAIStore.dispatch(setOpenAction({ isOpen }));
        }
    }, [genAIStore, isOpen]);

    useEffect(() => {
        onDispatcher?.(genAIStore.dispatch);
    }, [genAIStore, onDispatcher]);

    // Some apps, like Dashboards, already have an overlay controller, so we need to use that one
    const parentOverlayController = useOverlayController();
    const chatOverlayController = useMemo(
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
                                allowNativeLinks
                                linkHandler={onLinkClick}
                                catalogItems={catalogItems}
                                canManage={canManage}
                                canAnalyze={canAnalyze}
                                canFullControl={canFullControl}
                            >
                                <CustomizationProvider
                                    landingScreenComponentProvider={LandingScreenComponentProvider}
                                >
                                    <GenAIChatOverlay returnFocusTo={returnFocusTo} onClose={onClose} />
                                </CustomizationProvider>
                            </ConfigProvider>
                        </OverlayControllerProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
}
