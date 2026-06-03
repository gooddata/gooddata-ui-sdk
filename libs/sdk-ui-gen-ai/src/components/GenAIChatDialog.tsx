// (C) 2024-2026 GoodData Corporation

import { type ComponentType, type RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { type EnhancedStore } from "@reduxjs/toolkit";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type CatalogItem } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider, useOverlayController } from "@gooddata/sdk-ui-kit";

import { IntlWrapper } from "../localization/IntlWrapper.js";
import { isOpenSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { setOpenAction } from "../store/chatWindow/chatWindowSlice.js";
import { getIsOpened } from "../store/localStorage.js";

import { ConfigProvider, type LinkHandlerEvent } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import { GenAIChatOverlay } from "./GenAIChatOverlay.js";
import { GenAiStore, type GenAiStoreProps } from "./GenAiStore.js";

export type GenAIChatDialogProps = Omit<GenAiStoreProps, "children"> & {
    isOpen: boolean;
    locale?: string;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    onOpen: () => void;
    onClose: () => void;
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => void;
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
    onOpen,
    onClose,
    settings,
    returnFocusTo,
    objectTypes,
    includeTags,
    excludeTags,
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

    return (
        <IntlWrapper locale={locale}>
            <GenAiStore
                backend={effectiveBackend}
                workspace={effectiveWorkspace}
                onDispatcher={onDispatcher}
                eventHandlers={eventHandlers}
                colorPalette={colorPalette}
                settings={settings}
                objectTypes={objectTypes}
                includeTags={includeTags}
                excludeTags={excludeTags}
                catalogItems={catalogItems}
            >
                {(genAIStore) => (
                    <GenAIChatDialogContent
                        genAIStore={genAIStore}
                        backend={effectiveBackend}
                        workspace={effectiveWorkspace}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                        returnFocusTo={returnFocusTo}
                        onLinkClick={onLinkClick}
                        catalogItems={catalogItems}
                        canManage={canManage}
                        canAnalyze={canAnalyze}
                        canFullControl={canFullControl}
                        LandingScreenComponentProvider={LandingScreenComponentProvider}
                    />
                )}
            </GenAiStore>
        </IntlWrapper>
    );
}

type GenAIChatDialogContentProps = {
    genAIStore: EnhancedStore;
    backend: IAnalyticalBackend;
    workspace: string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => void;
    catalogItems?: CatalogItem[];
    canManage: boolean;
    canAnalyze: boolean;
    canFullControl: boolean;
    LandingScreenComponentProvider?: () => ComponentType;
};

function GenAIChatDialogContent({
    genAIStore,
    backend,
    workspace,
    isOpen,
    onOpen,
    onClose,
    returnFocusTo,
    onLinkClick,
    catalogItems,
    canManage,
    canAnalyze,
    canFullControl,
    LandingScreenComponentProvider,
}: GenAIChatDialogContentProps) {
    const open = useRef(onOpen);
    open.current = onOpen;
    const close = useRef(onClose);
    close.current = onClose;
    const isOpenRef = useRef(isOpen);

    useEffect(() => {
        if (isOpenRef.current === isOpen) {
            return;
        }
        isOpenRef.current = isOpen;

        const storeIsOpen = isOpenSelector(genAIStore.getState());
        if (storeIsOpen !== isOpenRef.current) {
            genAIStore.dispatch(setOpenAction({ isOpen }));
            if (isOpen) {
                open.current();
            } else {
                close.current();
            }
        }
    }, [genAIStore, isOpen]);

    useEffect(() => {
        const isOpen = getIsOpened();
        if (isOpen) {
            genAIStore.dispatch(setOpenAction({ isOpen }));
            open.current();
        }
    }, [genAIStore]);

    const onCloseHandler = useCallback(() => {
        genAIStore.dispatch(setOpenAction({ isOpen: false }));
        close.current();
    }, [genAIStore]);

    // Some apps, like Dashboards, already have an overlay controller, so we need to use that one
    const parentOverlayController = useOverlayController();
    const chatOverlayController = useMemo(
        () => parentOverlayController ?? OverlayController.getInstance(DEFAULT_CHAT_Z_INDEX),
        [parentOverlayController],
    );

    if (!isOpen) return null;

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
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
                            <GenAIChatOverlay returnFocusTo={returnFocusTo} onClose={onCloseHandler} />
                        </CustomizationProvider>
                    </ConfigProvider>
                </OverlayControllerProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
