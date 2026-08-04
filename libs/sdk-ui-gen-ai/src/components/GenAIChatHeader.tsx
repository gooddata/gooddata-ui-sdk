// (C) 2026 GoodData Corporation

import { type FC } from "react";

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { hasPinnedContextSelector, settingsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { setFullscreenAction, setHistoryAction } from "../store/chatWindow/chatWindowSlice.js";
import { hasMessagesSelector } from "../store/messages/messagesSelectors.js";
import { clearThreadAction, startNewConversationAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { HeaderIcon } from "./HeaderIcon.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

type GenAIChatHeaderOwnProps = {
    onClose: () => void;
};

type GenAIChatHeaderStateProps = {
    hasMessages: boolean;
    hasPinnedContext: boolean;
    settings: ReturnType<typeof settingsSelector>;
};

type GenAIChatHeaderDispatchProps = {
    clearThread: typeof clearThreadAction;
    setFullscreen: typeof setFullscreenAction;
    setHistory: typeof setHistoryAction;
    startNewConversation: typeof startNewConversationAction;
};

export type GenAIChatHeaderProps = GenAIChatHeaderOwnProps &
    GenAIChatHeaderStateProps &
    GenAIChatHeaderDispatchProps;

function GenAIChatHeaderComponent({
    settings,
    setHistory,
    clearThread,
    hasMessages,
    hasPinnedContext,
    setFullscreen,
    startNewConversation,
    onClose,
}: GenAIChatHeaderProps) {
    const intl = useIntl();

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

const mapStateToProps = (state: RootState): GenAIChatHeaderStateProps => ({
    hasMessages: hasMessagesSelector(state),
    hasPinnedContext: hasPinnedContextSelector(state),
    settings: settingsSelector(state),
});

const mapDispatchToProps: GenAIChatHeaderDispatchProps = {
    clearThread: clearThreadAction,
    setFullscreen: setFullscreenAction,
    setHistory: setHistoryAction,
    startNewConversation: startNewConversationAction,
};

export const GenAIChatHeader: FC<GenAIChatHeaderOwnProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAIChatHeaderComponent);
