// (C) 2026 GoodData Corporation

import { type ReactNode, useCallback, useState } from "react";

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
    /**
     * Whether the chat entry point should be visible in the header. Reflects both the
     * feature-flag/permission gate and the runtime LLM availability probe.
     */
    showChatItem: boolean;
    /** Open the chat dialog. */
    open: () => void;
    /** Open the chat dialog with a pre-seeded user question. */
    askAiAssistant: (question: string) => void;
}

export interface IUseHostChromeChatArgs {
    features: IHostChromeWorkspaceFeatures;
    ctx: IPlatformContext;
    telemetry: IPluggableAppTelemetryCallbacks | undefined;
}

/**
 * Owns the GenAI chat state and renders the `<GenAIChat>` element for the host chrome.
 *
 * Encapsulates open/close state, the seeded-question flow used by the AI-assistant entry
 * points, the runtime availability probe (`useGenAiChatAvailability`) and forwarding chat
 * events to the host telemetry callbacks.
 */
export function useHostChromeChat({ features, ctx, telemetry }: IUseHostChromeChatArgs): IHostChromeChat {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [askedQuestion, setAskedQuestion] = useState<string | null>(null);

    const open = useCallback(() => {
        setIsChatOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsChatOpen(false);
    }, []);

    const askAiAssistant = useCallback((question: string) => {
        setAskedQuestion(question);
        setIsChatOpen(true);
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
                canManageProject={features.canManageProject}
                canAnalyzeProject={features.canAccessWorkbench}
                canFullControl={features.canFullControl}
                settings={ctx.workspaceSettings}
                onEvent={handleChatEvent}
            />
        ) : null;

    return {
        element,
        showChatItem,
        open,
        askAiAssistant,
    };
}
