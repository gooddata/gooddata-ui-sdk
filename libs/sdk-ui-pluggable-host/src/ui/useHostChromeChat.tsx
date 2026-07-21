// (C) 2026 GoodData Corporation

import { type ReactNode, useCallback, useState } from "react";

import { type IGenAIUserContext } from "@gooddata/sdk-model";
import {
    type IPlatformContext,
    type IPluggableAppTelemetryCallbacks,
} from "@gooddata/sdk-pluggable-application-model";
import { useGenAiChatAvailability } from "@gooddata/sdk-ui-gen-ai";

import { getBackend } from "../platformContext/backend.js";

import { GenAIChat, type GenAIChatEvent } from "./GenAIChat.js";
import { type IHostChromeWorkspaceFeatures } from "./useHostChromeWorkspaceFeatures.js";

export interface IHostChromeChat {
    /** The `<GenAIChat>` element to mount, or `null` when chat is gated off. */
    element: ReactNode;
    /** Whether the chat dialog is currently open. */
    isOpen: boolean;
    /**
     * Whether the chat entry point should be visible in the header. Reflects both the
     * feature-flag/permission gate and the runtime LLM availability probe.
     */
    showChatItem: boolean;
    /** Open the chat dialog. */
    open: () => void;
    /** Close the chat dialog. */
    close: () => void;
    /** Toggle the chat dialog open/closed — used by the header chat button. */
    toggle: () => void;
    /**
     * Open the chat dialog with a pre-seeded user question and optional user-location context
     * (e.g. the active dashboard a hosted application forwards alongside the question).
     */
    askAiAssistant: (
        question: string,
        userContext?: IGenAIUserContext,
        appendToChat?: boolean,
        replaceUserContext?: boolean,
    ) => void;
    /**
     * Open the chat dialog with a pre-seeded optional user-location context
     * (e.g. the active dashboard a hosted application forwards alongside the question).
     */
    openAiAssistant: (userContext?: IGenAIUserContext, replaceUserContext?: boolean) => void;
    /**
     * Set the assistant's object-search tag scope, reflecting the active hosted application's
     * current view (e.g. AD's include/exclude tag route filters). Pass empty/undefined to clear.
     */
    setTags: (includeTags?: string[], excludeTags?: string[]) => void;
    /**
     * Set the ambient user context reported by the active hosted application (e.g. the open
     * dashboard and its live filter state). Persists across messages; pass undefined to clear.
     */
    setAmbientUserContext: (userContext?: IGenAIUserContext) => void;
}

export interface IUseHostChromeChatArgs {
    features: IHostChromeWorkspaceFeatures;
    ctx: IPlatformContext;
    telemetry: IPluggableAppTelemetryCallbacks | undefined;
    /** Where to place the chat (e.g. an embedded dashboard's left/right `showassistant` param). */
    dialogPosition?: "left" | "right";
    /** Whether the active app is embedded; switches the chat to the embedded presentation. */
    embedded?: boolean;
    /** Delegates a chat link click to the active app; returns true if the app handled it. */
    onAppLinkClick?: (link: { type?: string; id?: string; itemUrl?: string; newTab?: boolean }) => boolean;
}

/**
 * Owns the GenAI chat state and renders the `<GenAIChat>` element for the host chrome.
 *
 * Encapsulates open/close state, the seeded-question flow used by the AI-assistant entry
 * points, the runtime availability probe (`useGenAiChatAvailability`) and forwarding chat
 * events to the host telemetry callbacks.
 */
export function useHostChromeChat({
    features,
    ctx,
    telemetry,
    dialogPosition,
    embedded,
    onAppLinkClick,
}: IUseHostChromeChatArgs): IHostChromeChat {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
    const [appendToChat, setAppendToChat] = useState(false);
    const [replaceUserContext, setReplaceUserContext] = useState(false);
    // Bumped on every ask so the chat re-seeds (clears the thread + sends the message) even when the
    // same prompt is asked again — e.g. "Summarize" clicked twice, or repeated after a close (the
    // seeding effect is otherwise keyed on the question text, which does not change on a repeat).
    const [askSeq, setAskSeq] = useState(0);
    const [userContext, setUserContext] = useState<IGenAIUserContext | undefined>(undefined);
    const [ambientUserContext, setAmbientUserContext] = useState<IGenAIUserContext | undefined>(undefined);
    const [includeTags, setIncludeTags] = useState<string[] | undefined>(undefined);
    const [excludeTags, setExcludeTags] = useState<string[] | undefined>(undefined);

    const open = useCallback(() => {
        setIsChatOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsChatOpen(false);
    }, []);

    // The header chat button toggles the dialog (click to open, click again to close),
    // matching the standalone apps' behavior (LX-2544).
    const toggle = useCallback(() => {
        setIsChatOpen((isOpen) => !isOpen);
    }, []);

    const askAiAssistant = useCallback(
        (
            question: string,
            questionUserContext?: IGenAIUserContext,
            appendToChat?: boolean,
            replaceUserContext?: boolean,
        ) => {
            setAskedQuestion(question);
            setUserContext(questionUserContext);
            setAskSeq((seq) => seq + 1);
            setAppendToChat(appendToChat ?? false);
            setReplaceUserContext(replaceUserContext ?? false);
            setIsChatOpen(true);
        },
        [],
    );

    const openAiAssistant = useCallback(
        (questionUserContext?: IGenAIUserContext, replaceUserContext?: boolean) => {
            setAskedQuestion(null);
            setAppendToChat(false);
            setUserContext(questionUserContext);
            setReplaceUserContext(replaceUserContext ?? false);
            setAskSeq((seq) => seq + 1);
            setIsChatOpen(true);
        },
        [],
    );

    const setTags = useCallback((nextIncludeTags?: string[], nextExcludeTags?: string[]) => {
        // Normalize empty arrays to undefined so the chat treats "no scope" uniformly.
        setIncludeTags(nextIncludeTags?.length ? nextIncludeTags : undefined);
        setExcludeTags(nextExcludeTags?.length ? nextExcludeTags : undefined);
    }, []);

    const handleChatEvent = useCallback(
        (event: GenAIChatEvent) => {
            telemetry?.trackEvent(event.name, event.payload as unknown as Record<string, unknown>);
        },
        [telemetry],
    );

    const showChatItem = useGenAiChatAvailability(
        getBackend(),
        features.workspaceId,
        features.showChat,
        features.canManageProject,
    );

    const element: ReactNode =
        features.showChat && features.workspaceId ? (
            <GenAIChat
                workspaceId={features.workspaceId}
                open={isChatOpen}
                onOpen={open}
                onClose={close}
                askedQuestion={askedQuestion}
                appendToChat={appendToChat}
                replaceUserContext={replaceUserContext}
                askSeq={askSeq}
                userContext={userContext}
                ambientUserContext={ambientUserContext}
                includeTags={includeTags}
                excludeTags={excludeTags}
                canManageProject={features.canManageProject}
                canAnalyzeProject={features.canAccessWorkbench}
                canFullControl={features.canFullControl}
                settings={ctx.workspaceSettings}
                dialogPosition={dialogPosition}
                embedded={embedded}
                onAppLinkClick={onAppLinkClick}
                onEvent={handleChatEvent}
            />
        ) : null;

    return {
        element,
        isOpen: isChatOpen,
        showChatItem,
        open,
        close,
        toggle,
        askAiAssistant,
        openAiAssistant,
        setTags,
        setAmbientUserContext,
    };
}
