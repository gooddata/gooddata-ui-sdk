// (C) 2024-2026 GoodData Corporation

import { type FC, type RefObject, useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { connect } from "react-redux";

import { Dialog } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocal } from "../model.js";
import { setHistoryAction } from "../store/chatWindow/chatWindowSlice.js";
import { setCurrentConversationAction } from "../store/messages/messagesSlice.js";

import { GenAIChatConversations } from "./GenAIChatConversations.js";
import { GenAIChatHeader } from "./GenAIChatHeader.js";
import { GenAIChatWrapper } from "./GenAIChatWrapper.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";

export type GenAIChatOverlayDispatchProps = {
    setHistory: typeof setHistoryAction;
    loadConversation: typeof setCurrentConversationAction;
};

export type GenAIChatOverlayExternalProps = {
    returnFocusTo?: RefObject<HTMLElement | null> | string;
    onClose: () => void;
};

export type GenAIChatOverlayProps = GenAIChatOverlayExternalProps & GenAIChatOverlayDispatchProps;

function GenAIChatOverlayComponent({
    onClose,
    returnFocusTo,
    setHistory,
    loadConversation,
}: GenAIChatOverlayProps) {
    const intl = useIntl();
    const { isFullscreen } = useFullscreenCheck();

    const classNames = cx("gd-gen-ai-chat__window", {
        "gd-gen-ai-chat__window--fullscreen": isFullscreen,
    });

    const onHistoryClose = useCallback(() => {
        setHistory({ isHistory: false });
    }, [setHistory]);

    const onSelectConversation = useCallback(
        (conversation: IChatConversationLocal) => {
            loadConversation({ conversation });
            setHistory({ isHistory: false });
        },
        [loadConversation, setHistory],
    );

    return (
        <Dialog
            isModal={isFullscreen}
            returnFocusTo={returnFocusTo}
            returnFocusAfterClose={!!returnFocusTo}
            alignPoints={[{ align: isFullscreen ? "cc cc" : "br br" }]}
            submitOnEnterKey={false}
            closeOnEscape
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

const mapDispatchToProps: GenAIChatOverlayDispatchProps = {
    setHistory: setHistoryAction,
    loadConversation: setCurrentConversationAction,
};

export const GenAIChatOverlay: FC<GenAIChatOverlayExternalProps> = connect(
    null,
    mapDispatchToProps,
)(GenAIChatOverlayComponent);
