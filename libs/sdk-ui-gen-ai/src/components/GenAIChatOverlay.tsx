// (C) 2024-2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useMemo } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { Dialog } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocal } from "../model.js";
import {
    keyDriverAnalysisMinimizedSelector,
    keyDriverAnalysisSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import { setHistoryAction } from "../store/chatWindow/chatWindowSlice.js";
import { setCurrentConversationAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { isChatWindowCovered } from "./chatOverlayEscapeGuard.js";
import { GenAIChatConversations } from "./GenAIChatConversations.js";
import { GenAIChatHeader } from "./GenAIChatHeader.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export type GenAIChatOverlayExternalProps = {
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    className?: string;
    dialogPosition?: "left" | "right";
    /**
     * Host-side gate for Escape-to-close, on top of the built-in guard that already keeps the
     * chat open while it is visually covered by another overlay (see chatOverlayEscapeGuard).
     * Set to false to suppress Escape-to-close entirely, e.g. while the host runs UI whose
     * Escape handling must win even though it does not cover the chat window.
     */
    closeOnEscape?: boolean;
    onClose: () => void;
};

export function GenAIChatOverlay({
    onClose,
    returnFocusTo,
    dialogPosition,
    className,
    closeOnEscape: closeOnEscapeProp = true,
}: GenAIChatOverlayExternalProps) {
    const intl = useIntl();
    const { isFullscreen } = useFullscreenCheck();
    const dispatch = useDispatch();

    const keyDriverAnalysis = useSelector((state: RootState) => keyDriverAnalysisSelector(state));
    const keyDriverAnalysisMinimized = useSelector((state: RootState) =>
        keyDriverAnalysisMinimizedSelector(state),
    );

    const classNames = cx("gd-gen-ai-chat__window", className, {
        "gd-gen-ai-chat__window--fullscreen": isFullscreen,
        "gd-gen-ai-chat__window--left": !isFullscreen && dialogPosition === "left",
        "gd-gen-ai-chat__window--right": !isFullscreen && dialogPosition !== "left",
    });

    const onHistoryClose = useCallback(() => {
        dispatch(setHistoryAction({ isHistory: false }));
    }, [dispatch]);

    const onSelectConversation = useCallback(
        (conversation: IChatConversationLocal) => {
            dispatch(setCurrentConversationAction({ conversation }));
            dispatch(setHistoryAction({ isHistory: false }));
        },
        [dispatch],
    );

    const position = useMemo(() => {
        if (isFullscreen) {
            return "cc cc";
        }
        if (dialogPosition === "left") {
            return "bl bl";
        }
        return "br br";
    }, [dialogPosition, isFullscreen]);

    const closeOnEscape = closeOnEscapeProp && (!keyDriverAnalysis || keyDriverAnalysisMinimized);

    // Escape handling is ours, not the Dialog's: its closeOnEscape listens on window with no
    // overlay stack awareness, so an Escape aimed at an overlay covering the chat (e.g.
    // Dashboards' insight editing overlay) would close the chat with the very same press. Close
    // only when the chat window is not covered — Escape then peels one layer per press, the
    // covering layer closing itself through its own listener.
    useEffect(() => {
        if (!closeOnEscape) {
            return undefined;
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !isChatWindowCovered()) {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [closeOnEscape, onClose]);

    return (
        <Dialog
            isModal={isFullscreen}
            returnFocusTo={returnFocusTo}
            returnFocusAfterClose={!!returnFocusTo}
            alignPoints={[{ align: position }]}
            closeOnEscape={false}
            submitOnEnterKey={false}
            closeOnParentScroll={false}
            closeOnMouseDrag={false}
            onClose={onClose}
            className={classNames}
            accessibilityConfig={{
                title: intl.formatMessage({ id: "gd.gen-ai.dialog.label" }),
                isModal: isFullscreen,
            }}
        >
            <GenAIChatHeader onClose={onClose} />
            <GenAIChatConversations onClose={onHistoryClose} onSelect={onSelectConversation} />
            <GenAIChatWrapper autofocus />
        </Dialog>
    );
}
