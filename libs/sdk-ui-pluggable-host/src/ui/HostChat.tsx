// (C) 2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IGenAIUserContext, type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";
import { BackendProvider, resolveLocale } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { getAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";
import { getBackend } from "../platformContext/backend.js";

import { HostIntlProvider } from "./HostIntlProvider.js";
import { useHostChromeChat } from "./useHostChromeChat.js";
import { useHostChromeWorkspaceFeatures } from "./useHostChromeWorkspaceFeatures.js";
import "@gooddata/sdk-ui-gen-ai/styles/css/main.css";

/**
 * AI-assistant open/close/toggle request. `seq` changes on every request so an identical repeat
 * (e.g. "Summarize" clicked again, or the header button toggled) still re-triggers the effect.
 */
export interface IHostChatVisibility {
    kind: "open" | "close" | "toggle";
    question?: string;
    userContext?: IGenAIUserContext;
    seq: number;
}

/** A link clicked inside the chat, delegated to the active application for in-app handling. */
export interface IHostChatLink {
    type?: string;
    id?: string;
    itemUrl?: string;
    newTab?: boolean;
}

/**
 * AI-assistant presentation/context reported by the active pluggable application: its object-search
 * tag scope plus, when embedded, how the host chat should be presented.
 */
export interface IHostChatContext {
    includeTags?: string[];
    excludeTags?: string[];
    dialogPosition?: "left" | "right";
    embedded?: boolean;
}

export interface IHostChatProps {
    ctx: IPlatformContext;
    resolvedApplications: PluggableApplicationRegistryItem[];
    pathname: string;
    /** Id of the active pluggable application; used to reset tag scope on app switch. */
    activeAppId?: string;
    /** Latest open/close/toggle request (from app events, the header button, or header search). */
    visibility?: IHostChatVisibility | null;
    /** Latest tag scope / presentation reported by the active pluggable application. */
    context?: IHostChatContext | null;
    /** Reports the chat open-state so the runtime can forward it to the active app. */
    onOpenChange?: (open: boolean) => void;
    /** Reports the header chat-button state (visibility + open) so the host UI can render it. */
    onChatStateChange?: (state: { showChatItem: boolean; isOpen: boolean }) => void;
    /**
     * Delegates a chat link click to the active application (e.g. an embedded dashboard opening a
     * visualization as an in-place overlay). Returns true if the app handled it.
     */
    onAppLinkClick?: (link: IHostChatLink) => boolean;
}

/**
 * Owns and renders the host's single GenAI chat, decoupled from the host UI module.
 *
 * @remarks
 * Rendered by {@link HostUiContainer} in its own React tree (with the providers the chat needs), so
 * the chat survives a custom remote UI module and stays mounted when the chrome is hidden
 * (embedded/export). The header chat button and app-side controls drive it through the `visibility`
 * and `context` props; it reports its open-state and button state back via callbacks.
 */
export function HostChat({
    ctx,
    resolvedApplications,
    pathname,
    activeAppId,
    visibility = null,
    context = null,
    onOpenChange,
    onChatStateChange,
    onAppLinkClick,
}: IHostChatProps) {
    const features = useHostChromeWorkspaceFeatures(resolvedApplications, ctx, pathname);

    const shellTelemetry = useMemo(
        () => getAppLifecycleCallbacks()?.createTelemetryCallbacks?.("host-ui"),
        [],
    );

    const chat = useHostChromeChat({
        features,
        ctx,
        telemetry: shellTelemetry,
        dialogPosition: context?.dialogPosition,
        embedded: context?.embedded,
        onAppLinkClick,
    });
    const {
        askAiAssistant: chatAskAiAssistant,
        open: chatOpen,
        close: chatClose,
        toggle: chatToggle,
        setTags: chatSetTags,
        isOpen: chatIsOpen,
        showChatItem,
    } = chat;

    // Report the chat open-state outward so the runtime can forward it to the active pluggable
    // application, keeping app-side assistant controls (and their echoed results) aligned (LX-2544).
    useEffect(() => {
        onOpenChange?.(chatIsOpen);
    }, [chatIsOpen, onOpenChange]);

    // Report the header chat-button state so the host UI module can render the button to match.
    useEffect(() => {
        onChatStateChange?.({ showChatItem, isOpen: chatIsOpen });
    }, [showChatItem, chatIsOpen, onChatStateChange]);

    // Effect order matters: the tag-scope effects are declared before the open/ask effect so that,
    // when a tag-scope change and an open/ask request land in the same commit, the host chat is
    // already scoped before the seeded question is sent.

    // Clear any stale tag scope when the active application changes. The newly active app re-reports
    // its own scope (or none) right after it mounts; without this reset, switching from a tag-scoped
    // app to one that reports no scope (e.g. the metric editor) would leak the old scope.
    useEffect(() => {
        chatSetTags(undefined, undefined);
    }, [activeAppId, chatSetTags]);

    useEffect(() => {
        chatSetTags(context?.includeTags, context?.excludeTags);
    }, [context, chatSetTags]);

    const visibilitySeq = visibility?.seq;
    useEffect(() => {
        if (!visibility) {
            return;
        }
        if (visibility.kind === "close") {
            chatClose();
        } else if (visibility.kind === "toggle") {
            chatToggle();
        } else if (visibility.question) {
            chatAskAiAssistant(visibility.question, visibility.userContext);
        } else {
            chatOpen();
        }
        // `seq` changes on every request, so a repeated identical open/ask/toggle still re-runs this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visibilitySeq, chatAskAiAssistant, chatOpen, chatClose, chatToggle]);

    return (
        <HostIntlProvider locale={resolveLocale(ctx.preferredLocale)}>
            <BackendProvider backend={getBackend()}>
                <ToastsCenterContextProvider>{chat.element}</ToastsCenterContextProvider>
            </BackendProvider>
        </HostIntlProvider>
    );
}
