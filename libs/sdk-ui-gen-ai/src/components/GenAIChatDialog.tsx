// (C) 2024-2026 GoodData Corporation

import { type ComponentType, type RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { type EnhancedStore } from "@reduxjs/toolkit";
import { Provider as StoreProvider } from "react-redux";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { type CatalogItem, type GenAIObjectType, type IColorPalette } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { OverlayController, OverlayControllerProvider, useOverlayController } from "@gooddata/sdk-ui-kit";

import { ConfigProvider, type LinkHandlerEvent } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import { GenAIChatOverlay } from "./GenAIChatOverlay.js";
import { useGenAIStore } from "../hooks/useGenAIStore.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { type ChatEventHandler } from "../store/events.js";
import { getIsOpened, isOpenSelector, setOpenAction } from "../store/index.js";

export type GenAIChatDialogProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    isOpen: boolean;
    locale?: string;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    objectTypes?: GenAIObjectType[];
    includeTags?: string[];
    excludeTags?: string[];
    settings?: IUserWorkspaceSettings;
    onOpen: () => void;
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
    const genAIStore = useGenAIStore(effectiveBackend, effectiveWorkspace, {
        eventHandlers,
        colorPalette,
        settings,
        objectTypes,
        includeTags,
        excludeTags,
    });

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
                                    <GenAIChatOverlay
                                        returnFocusTo={returnFocusTo}
                                        onClose={onCloseHandler}
                                    />
                                </CustomizationProvider>
                            </ConfigProvider>
                        </OverlayControllerProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </StoreProvider>
        </IntlWrapper>
    );
}
