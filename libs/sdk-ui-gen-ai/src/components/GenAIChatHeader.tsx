// (C) 2026 GoodData Corporation

import { type FC } from "react";

import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { settingsSelector } from "../store/chatWindow/chatWindowSelectors.js";
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
    setFullscreen,
    startNewConversation,
    onClose,
}: GenAIChatHeaderProps) {
    const intl = useIntl();

    const { isFullscreen, isSmallScreen } = useFullscreenCheck();

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
                    disabled={!hasMessages}
                />
            )}
            <div className="gd-gen-ai-chat__window__header__gap"></div>
            {isSmallScreen ? null : (
                <>
                    {settings?.enableAiAgenticMultiConversations ? (
                        <HeaderIcon
                            icon="edit"
                            tooltip={intl.formatMessage({
                                id: "gd.gen-ai.header.new-conversation-tooltip",
                            })}
                            onClick={() => startNewConversation()}
                            disabled={!hasMessages}
                        />
                    ) : null}
                    <HeaderIcon
                        icon={isFullscreen ? "minimize" : "expand"}
                        tooltip={
                            isFullscreen
                                ? intl.formatMessage({ id: "gd.gen-ai.header.contract-tooltip" })
                                : intl.formatMessage({ id: "gd.gen-ai.header.expand-tooltip" })
                        }
                        onClick={() => setFullscreen({ isFullscreen: !isFullscreen })}
                    />
                    <div className="gd-gen-ai-chat__window__header__divider"></div>
                </>
            )}
            <HeaderIcon
                icon="cross"
                tooltip={intl.formatMessage({ id: "gd.gen-ai.header.close-tooltip" })}
                onClick={onClose}
            />
        </div>
    );
}

const mapStateToProps = (state: RootState): GenAIChatHeaderStateProps => ({
    hasMessages: hasMessagesSelector(state),
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
