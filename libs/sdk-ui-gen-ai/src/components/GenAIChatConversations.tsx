// (C) 2026 GoodData Corporation

import { type FC, type RefObject, useCallback, useMemo, useRef, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { connect, useSelector } from "react-redux";

import {
    DefaultUiMenuInteractiveItemWrapper,
    type IUiMenuItem,
    UiDrawer,
    UiIcon,
    UiIconButton,
    UiMenu,
} from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocal } from "../model.js";
import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { setHistoryAction } from "../store/chatWindow/chatWindowSlice.js";
import { conversationSelector, conversationsSelector } from "../store/messages/messagesSelectors.js";
import { deleteConversationAction, setCurrentConversationAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";
import { generateTemporaryTitle } from "../utils.js";

import { collectReferences, replaceReferences } from "./completion/references.js";
import { ConversationDeleteDialog } from "./ConversationDeleteDialog.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { useHistoryCheck } from "./hooks/useHistoryCheck.js";
import { ConversationDateGroup, groupConversationsByDate } from "./utils/conversationGrouper.js";

type GenAIChatConversationsStateProps = {
    conversation: ReturnType<typeof conversationSelector>;
    conversations: ReturnType<typeof conversationsSelector>;
};

type GenAIChatConversationsDispatchProps = {
    setHistory: typeof setHistoryAction;
    loadConversation: typeof setCurrentConversationAction;
    deleteConversation: typeof deleteConversationAction;
};

export type GenAIChatConversationsProps = GenAIChatConversationsStateProps &
    GenAIChatConversationsDispatchProps;

function GenAIChatConversationsComponent({
    setHistory,
    deleteConversation,
    loadConversation,
    conversations,
    conversation: currentConversation,
}: GenAIChatConversationsProps) {
    const ref = useRef<HTMLElement>(undefined);
    const intl = useIntl();

    const { isFullscreen, isSmallScreen } = useFullscreenCheck();
    const { isHistory } = useHistoryCheck();
    const [conversationToDelete, setConversationToDelete] = useState<IChatConversationLocal | undefined>();

    const catalogItems = useSelector(catalogItemsSelector);

    const groupedConversations = useMemo(() => groupConversationsByDate(conversations), [conversations]);

    const menuItems = useMemo<IUiMenuItem[]>(
        () =>
            groupedConversations.map((group) => ({
                type: "group" as const,
                id: group.group,
                stringTitle: getConversationGroupLabel(group.group, intl),
                data: group.group,
                subItems: group.conversations.map((conversation) => ({
                    type: "interactive" as const,
                    id: conversation.id,
                    stringTitle: replaceReferences(
                        conversation.title ?? "",
                        collectReferences(conversation.title ?? "", catalogItems),
                    ),
                    data: conversation,
                    iconRight: (
                        <div className="gd-gen-ai-chat__window__conversations__list__delete-button">
                            <UiIconButton
                                isDesctructive
                                size="xsmall"
                                variant="tertiary"
                                label={intl.formatMessage({
                                    id: "gd.gen-ai.conversations.delete-button.aria-label",
                                })}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setConversationToDelete(conversation);
                                }}
                                tabIndex={-1}
                                icon="trash"
                            />
                        </div>
                    ),
                    isSelected:
                        currentConversation === "new" ? false : conversation.id === currentConversation?.id,
                })),
            })),
        [groupedConversations, intl, catalogItems, currentConversation],
    );

    const handleDeleteCancel = useCallback(() => {
        setConversationToDelete(undefined);
    }, []);

    const handleSelect = useCallback(
        (conversation: IChatConversationLocal) => {
            loadConversation({ conversation });
            setHistory({ isHistory: false });
        },
        [loadConversation, setHistory],
    );

    const handleDeleteSubmit = useCallback(() => {
        if (conversationToDelete) {
            deleteConversation({ conversationId: conversationToDelete.id });
        }
        setConversationToDelete(undefined);
    }, [conversationToDelete, deleteConversation]);

    return (
        <>
            <div className="gd-gen-ai-chat__window__drawer" ref={ref as RefObject<HTMLDivElement>}></div>
            <UiDrawer
                anchor="left"
                showCloseButton
                open={isHistory}
                node={ref.current}
                showBackdrop={false}
                header={
                    <div style={{ width: "100%" }}>
                        <div className="gd-gen-ai-chat__window__conversations__header">
                            {intl.formatMessage({ id: "gd.gen-ai.conversations.title" })}
                        </div>
                        <div className="gd-gen-ai-chat__window__conversations__divider" />
                    </div>
                }
                closeLabel={intl.formatMessage({ id: "gd.gen-ai.conversations.close-label" })}
                onClickClose={() => setHistory({ isHistory: false })}
                onClickOutside={() => setHistory({ isHistory: false })}
            >
                <div
                    className={cx("gd-gen-ai-chat__window__conversations", {
                        "gd-gen-ai-chat__window__conversations--isFullscreen": isFullscreen,
                        "gd-gen-ai-chat__window__conversations--isSmallScreen": isSmallScreen,
                    })}
                >
                    {(conversations ?? []).length === 0 ? (
                        <div className="gd-gen-ai-chat__window__conversations__empty">
                            <UiIcon type="history2" size={20} color="complementary-6" />
                            <div className="gd-gen-ai-chat__window__conversations__empty__text">
                                <FormattedMessage
                                    id="gd.gen-ai.conversations.empty"
                                    values={{
                                        br: <br />,
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="gd-gen-ai-chat__window__conversations__list">
                            <UiMenu
                                onUnhandledKeyDown={(event, { focusedItem }) => {
                                    if (event.key === "Delete" && focusedItem) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setConversationToDelete(focusedItem.data as IChatConversationLocal);
                                    }
                                }}
                                InteractiveItemWrapper={(props) => {
                                    const data = props.item.data as IChatConversationLocal;
                                    return (
                                        <div
                                            className={cx(
                                                "gd-gen-ai-chat__window__conversations__list__item",
                                                {
                                                    generatingTitle: data.generatingTitle,
                                                },
                                            )}
                                        >
                                            <DefaultUiMenuInteractiveItemWrapper
                                                {...props}
                                                item={{
                                                    ...props.item,
                                                    stringTitle:
                                                        props.item.stringTitle ||
                                                        generateTemporaryTitle(intl, data),
                                                }}
                                            />
                                        </div>
                                    );
                                }}
                                items={menuItems}
                                onSelect={(item, event) => {
                                    handleSelect(item.data as IChatConversationLocal);
                                    event.stopPropagation();
                                    event.preventDefault();
                                }}
                                shouldCloseOnSelect={false}
                                size="small"
                                ariaAttributes={{
                                    id: "gd-gen-ai-conversations-menu",
                                    "aria-label": intl.formatMessage({ id: "gd.gen-ai.conversations.title" }),
                                }}
                            />
                        </div>
                    )}
                </div>
            </UiDrawer>
            {conversationToDelete ? (
                <ConversationDeleteDialog
                    conversation={conversationToDelete}
                    onClose={handleDeleteCancel}
                    onDelete={handleDeleteSubmit}
                />
            ) : null}
        </>
    );
}

const mapStateToProps = (state: RootState): GenAIChatConversationsStateProps => ({
    conversation: conversationSelector(state),
    conversations: conversationsSelector(state),
});

const mapDispatchToProps: GenAIChatConversationsDispatchProps = {
    setHistory: setHistoryAction,
    deleteConversation: deleteConversationAction,
    loadConversation: setCurrentConversationAction,
};

export const GenAIChatConversations: FC = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAIChatConversationsComponent);

function getConversationGroupLabel(group: ConversationDateGroup, intl: ReturnType<typeof useIntl>): string {
    switch (group) {
        case ConversationDateGroup.TODAY:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.today" });
        case ConversationDateGroup.LAST_7_DAYS:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.last-7-days" });
        case ConversationDateGroup.OLDER:
        default:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.older" });
    }
}
