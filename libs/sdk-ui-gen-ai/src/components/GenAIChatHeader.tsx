// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { hasPinnedContextSelector, settingsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { setFullscreenAction, setHistoryAction } from "../store/chatWindow/chatWindowSlice.js";
import { hasMessagesSelector } from "../store/messages/messagesSelectors.js";
import { clearThreadAction, startNewConversationAction } from "../store/messages/messagesSlice.js";

import { HeaderIcon } from "./HeaderIcon.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export interface IGenAIChatHeaderProps {
    onClose: () => void;
}

export function GenAIChatHeader({ onClose }: IGenAIChatHeaderProps) {
    const intl = useIntl();
    const dispatch = useDispatch();

    const hasMessages = useSelector(hasMessagesSelector);
    const hasPinnedContext = useSelector(hasPinnedContextSelector);
    const settings = useSelector(settingsSelector);

    const clearThread = useCallback(
        (...args: Parameters<typeof clearThreadAction>) => dispatch(clearThreadAction(...args)),
        [dispatch],
    );
    const setFullscreen = useCallback(
        (...args: Parameters<typeof setFullscreenAction>) => dispatch(setFullscreenAction(...args)),
        [dispatch],
    );
    const setHistory = useCallback(
        (...args: Parameters<typeof setHistoryAction>) => dispatch(setHistoryAction(...args)),
        [dispatch],
    );
    const startNewConversation = useCallback(
        (...args: Parameters<typeof startNewConversationAction>) =>
            dispatch(startNewConversationAction(...args)),
        [dispatch],
    );

    const { isFullscreen, isSmallScreen } = useFullscreenCheck();
    const canStartOver = hasMessages || hasPinnedContext;

    return (
        <div className="gd-gen-ai-chat__window__header">
            {settings?.enableAiAgenticMultiConversations ? (
                <HeaderIcon
                    icon="history2"
                    tooltip={intl.formatMessage({ id: "gd.gen-ai.header.conversations-tooltip" })}
                    onClick={() => setHistory({ isHistory: true })}
                />
            ) : (
                <HeaderIcon
                    icon="ccw"
                    tooltip={intl.formatMessage({ id: "gd.gen-ai.header.reset-tooltip" })}
                    onClick={() => clearThread()}
                    disabled={!canStartOver}
                />
            )}
            <div className="gd-gen-ai-chat__window__header__gap"></div>
            {isSmallScreen ? null : (
                <>
                    {settings?.enableAiAgenticMultiConversations ? (
                        <HeaderIcon
                            icon="edit"
                            arrowPlacement="top-end"
                            tooltip={intl.formatMessage({
                                id: "gd.gen-ai.header.new-conversation-tooltip",
                            })}
                            onClick={() => startNewConversation()}
                            disabled={!canStartOver}
                        />
                    ) : null}
                    <HeaderIcon
                        icon={isFullscreen ? "minimize" : "expand"}
                        arrowPlacement="top-end"
                        tooltip={
                            isFullscreen
                                ? intl.formatMessage({ id: "gd.gen-ai.header.contract-tooltip" })
                                : intl.formatMessage({ id: "gd.gen-ai.header.expand-tooltip" })
                        }
                        onClick={() => setFullscreen({ isFullscreen: !isFullscreen })}
                    />
                </>
            )}
            <HeaderIcon
                icon="cross"
                arrowPlacement="top-end"
                tooltip={intl.formatMessage({ id: "gd.gen-ai.header.close-tooltip" })}
                onClick={onClose}
            />
        </div>
    );
}
