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
import { KeyDriverAnalysis } from "./KeyDriverAnalysis.js";

export type GenAIChatDialogProps = Omit<GenAiStoreProps, "children"> & {
    isOpen: boolean;
    disabled?: boolean;
    className?: string;
    dialogPosition?: "left" | "right";
    locale?: string;
    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    onOpen: () => void;
    onClose: () => void;
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
    LandingScreenComponentProvider?: () => ComponentType;
};

// Default z-index:
// - High enough to be over other dialogs
// - Below chart tooltips
const DEFAULT_CHAT_Z_INDEX = 3000;
// - Must be more than DEFAULT_CHAT_Z_INDEX
const DEFAULT_KDA_Z_INDEX = 3050;

export function GenAIChatDialog({
    backend,
    workspace,
    locale,
    disabled,
    isOpen,
    onOpen,
    onClose,
    settings,
    className,
    dialogPosition,
    allowNativeLinks = true,
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
                allowNativeLinks={allowNativeLinks}
                onLinkClick={onLinkClick}
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
                        className={className}
                        dialogPosition={dialogPosition}
                        disabled={disabled}
                        isOpen={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                        returnFocusTo={returnFocusTo}
                        allowNativeLinks={allowNativeLinks}
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
    className?: string;
    dialogPosition?: "left" | "right";
    disabled?: boolean;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    allowNativeLinks?: boolean;
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
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
    className,
    dialogPosition,
    disabled,
    isOpen,
    onOpen,
    onClose,
    returnFocusTo,
    onLinkClick,
    allowNativeLinks,
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
    const isOpenRef = useRef(isOpen && !disabled);

    useEffect(() => {
        if (disabled) {
            return;
        }
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
    }, [genAIStore, isOpen, disabled]);

    useEffect(() => {
        const isOpen = getIsOpened();
        if (isOpen && !disabled) {
            genAIStore.dispatch(setOpenAction({ isOpen }));
            open.current();
        }
    }, [genAIStore, disabled]);

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
    const kdaOverlayController = useMemo(
        () => parentOverlayController ?? OverlayController.getInstance(DEFAULT_KDA_Z_INDEX),
        [parentOverlayController],
    );

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspace}>
                <OverlayControllerProvider overlayController={chatOverlayController}>
                    {isOpen && !disabled ? (
                        <ConfigProvider
                            allowNativeLinks={allowNativeLinks}
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
                                    className={className}
                                    dialogPosition={dialogPosition}
                                    returnFocusTo={returnFocusTo}
                                    onClose={onCloseHandler}
                                />
                            </CustomizationProvider>
                        </ConfigProvider>
                    ) : null}
                    <OverlayControllerProvider overlayController={kdaOverlayController}>
                        <KeyDriverAnalysis />
                    </OverlayControllerProvider>
                </OverlayControllerProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
