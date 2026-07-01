// (C) 2026 GoodData Corporation

import { useLayoutEffect, useRef, useState } from "react";

import { flushSync } from "react-dom";
import { type Root, createRoot } from "react-dom/client";

import { type IGenAIUserContext, type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import {
    type IAppHeaderOptions,
    type IHostUiModule,
    type IHostUiMountHandle,
    type IHostUiMountOptions,
    type IHostUiNotification,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

import { HostChrome } from "./HostChrome.js";
import { e } from "./hostChromeBem.js";
import "./DefaultHostUi.scss";

/** Host-owned chat button state pushed down from the runtime so the header button can match it. */
interface IChatButtonState {
    showChatItem: boolean;
    isOpen: boolean;
}

// ---------------------------------------------------------------------------
// Bridge component that exposes React state setters to the imperative handle
// ---------------------------------------------------------------------------

interface IHostUiBridgeProps {
    initialCtx: IPlatformContext;
    initialApps: PluggableApplicationRegistryItem[];
    initialPathname: string;
    navigate: (url: string) => void;
    replace: (url: string) => void;
    onChatToggleRequested?: () => void;
    onAskAiAssistant?: (question: string, userContext?: IGenAIUserContext) => void;
    onAppContainerReady: (el: HTMLElement) => void;
    onReady: (
        setCtx: (ctx: IPlatformContext) => void,
        setApps: (apps: PluggableApplicationRegistryItem[]) => void,
        setPathname: (pathname: string) => void,
        setHeaderOptions: (header: IAppHeaderOptions | undefined) => void,
        setNotification: (notification: IHostUiNotification | null) => void,
        setPageTitle: (pageTitle: string | undefined) => void,
        setChatState: (state: IChatButtonState) => void,
    ) => void;
}

function HostUiBridge({
    initialCtx,
    initialApps,
    initialPathname,
    navigate,
    replace,
    onChatToggleRequested,
    onAskAiAssistant,
    onAppContainerReady,
    onReady,
}: IHostUiBridgeProps) {
    const [ctx, setCtx] = useState(initialCtx);
    const [apps, setApps] = useState(initialApps);
    const [pathname, setPathname] = useState(initialPathname);
    const [headerOptions, setHeaderOptions] = useState<IAppHeaderOptions | undefined>(undefined);
    const [notification, setNotification] = useState<IHostUiNotification | null>(null);
    const [pageTitle, setPageTitle] = useState<string | undefined>(undefined);
    // The host runtime owns the single chat instance (outside this UI module); it pushes the chat
    // button state here so the header button reflects the chat's availability and open-state.
    const [chatState, setChatState] = useState<IChatButtonState>({ showChatItem: false, isOpen: false });
    const appContainerRef = useRef<HTMLDivElement>(null);

    // Layout effect runs in the same synchronous commit as flushSync.
    useLayoutEffect(() => {
        onReady(setCtx, setApps, setPathname, setHeaderOptions, setNotification, setPageTitle, setChatState);
        if (appContainerRef.current) {
            onAppContainerReady(appContainerRef.current);
        }
        // Only call once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <HostChrome
            ctx={ctx}
            resolvedApplications={apps}
            pathname={pathname}
            onNavigate={navigate}
            onReplace={replace}
            headerOptions={headerOptions}
            notification={notification}
            showChatItem={chatState.showChatItem}
            chatIsOpen={chatState.isOpen}
            onChatToggle={onChatToggleRequested}
            onAskAiAssistant={onAskAiAssistant}
            appPageTitle={pageTitle}
        >
            <div ref={appContainerRef} className={e("app-container")} />
        </HostChrome>
    );
}

// ---------------------------------------------------------------------------
// Imperative mount function conforming to IHostUiModule
// ---------------------------------------------------------------------------

function mountDefaultHostUi(options: IHostUiMountOptions): IHostUiMountHandle {
    const {
        container,
        ctx,
        resolvedApplications,
        pathname,
        navigate,
        replace,
        onChatToggleRequested,
        onAskAiAssistant,
    } = options;

    let reactRoot: Root | null = createRoot(container);
    let appContainer: HTMLElement | null = null;

    let updateCtxFn: ((ctx: IPlatformContext) => void) | null = null;
    let updateAppsFn: ((apps: PluggableApplicationRegistryItem[]) => void) | null = null;
    let updatePathnameFn: ((pathname: string) => void) | null = null;
    let updateHeaderFn: ((header: IAppHeaderOptions | undefined) => void) | null = null;
    let updateNotificationFn: ((notification: IHostUiNotification | null) => void) | null = null;
    let updateDocumentTitleFn: ((pageTitle: string | undefined) => void) | null = null;
    let updateChatStateFn: ((state: IChatButtonState) => void) | null = null;

    // Use flushSync so that the DOM is ready synchronously after mount() returns,
    // making getAppContainer() safe to call immediately.
    flushSync(() => {
        reactRoot?.render(
            <HostUiBridge
                initialCtx={ctx}
                initialApps={resolvedApplications}
                initialPathname={pathname}
                navigate={navigate}
                replace={replace}
                onChatToggleRequested={onChatToggleRequested}
                onAskAiAssistant={onAskAiAssistant}
                onAppContainerReady={(el) => {
                    appContainer = el;
                }}
                onReady={(
                    setCtx,
                    setApps,
                    setPathname,
                    setHeaderOptions,
                    setNotification,
                    setPageTitle,
                    setChatState,
                ) => {
                    updateCtxFn = setCtx;
                    updateAppsFn = setApps;
                    updatePathnameFn = setPathname;
                    updateHeaderFn = setHeaderOptions;
                    updateNotificationFn = setNotification;
                    updateDocumentTitleFn = setPageTitle;
                    updateChatStateFn = setChatState;
                }}
            />,
        );
    });

    return {
        unmount() {
            if (reactRoot) {
                const root = reactRoot;
                reactRoot = null;
                appContainer = null;
                updateCtxFn = null;
                updateAppsFn = null;
                updatePathnameFn = null;
                updateHeaderFn = null;
                updateNotificationFn = null;
                updateDocumentTitleFn = null;
                updateChatStateFn = null;
                root.unmount();
            }
        },

        updateContext(newCtx) {
            updateCtxFn?.(newCtx);
        },

        updateApplications(apps: PluggableApplicationRegistryItem[]) {
            updateAppsFn?.(apps);
        },

        updatePathname(newPathname: string) {
            updatePathnameFn?.(newPathname);
        },

        updateHeader(header: IAppHeaderOptions | undefined) {
            updateHeaderFn?.(header);
        },

        updateDocumentTitle(pageTitle: string | undefined) {
            updateDocumentTitleFn?.(pageTitle);
        },

        updateChatState(state) {
            updateChatStateFn?.(state);
        },

        getAppContainer(): HTMLElement {
            if (!appContainer) {
                throw new Error(
                    "Host UI app container is not available. " +
                        "Ensure the host UI has finished mounting before calling getAppContainer().",
                );
            }
            return appContainer;
        },

        notify(notification: IHostUiNotification) {
            updateNotificationFn?.(notification);
        },
    };
}

/**
 * Default host UI module.
 *
 * Renders the GoodData application host with the standard AppHeader (branding, navigation,
 * user menu, help menu) and provides a container element for the active pluggable application.
 *
 * Navigation is handled via the host-provided `navigate` callback, keeping the host UI
 * framework-agnostic and ensuring consistent behavior for both local and remote UI modules.
 */
export const defaultHostUiModule: IHostUiModule = {
    mount: mountDefaultHostUi,
};
