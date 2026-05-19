// (C) 2026 GoodData Corporation

import {
    type DragEvent,
    type FC,
    type KeyboardEvent,
    type RefObject,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { connect, useSelector } from "react-redux";

import {
    DefaultUiMenuInteractiveItemWrapper,
    Dropdown,
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
import {
    deleteConversationAction,
    pinConversationAction,
    renameConversationAction,
    setCurrentConversationAction,
} from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";
import { isConversationWithLocalId } from "../store/utils.js";
import { generateTemporaryTitle } from "../utils.js";

import { collectReferences, replaceReferences } from "./completion/references.js";
import { ConversationDeleteDialog } from "./ConversationDeleteDialog.js";
import { ConversationRenameDialog } from "./ConversationRenameDialog.js";
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
    pinConversation: typeof pinConversationAction;
    renameConversation: typeof renameConversationAction;
};

export type GenAIChatConversationsProps = GenAIChatConversationsStateProps &
    GenAIChatConversationsDispatchProps;

type ConversationDropZone = "pin" | "unpin" | "body";

function GenAIChatConversationsComponent({
    setHistory,
    deleteConversation,
    pinConversation,
    renameConversation,
    loadConversation,
    conversations,
    conversation: currentConversation,
}: GenAIChatConversationsProps) {
    const ref = useRef<HTMLElement>(undefined);
    const intl = useIntl();

    const { isFullscreen, isSmallScreen } = useFullscreenCheck();
    const { isHistory } = useHistoryCheck();
    const [conversationToDelete, setConversationToDelete] = useState<IChatConversationLocal | undefined>();
    const [conversationToRename, setConversationToRename] = useState<IChatConversationLocal | undefined>();
    const [openedId, setOpenedId] = useState<string | undefined>();
    const [draggedConversationId, setDraggedConversationId] = useState<string | undefined>();
    const [activeDropZone, setActiveDropZone] = useState<ConversationDropZone | undefined>();

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
                    id: conversation.localId,
                    stringTitle: replaceReferences(
                        conversation.title ?? "",
                        collectReferences(conversation.title ?? "", catalogItems),
                    ),
                    data: conversation,
                    iconRight: (
                        <div className="gd-gen-ai-chat__window__conversations__list__delete-button">
                            <Dropdown
                                onToggle={() => {
                                    setOpenedId(openedId ? undefined : conversation.localId);
                                }}
                                isOpen={openedId === conversation.localId}
                                alignPoints={[{ align: "bl tl" }]}
                                renderButton={({
                                    toggleDropdown,
                                    buttonRef,
                                    ariaAttributes,
                                    accessibilityConfig,
                                }) => (
                                    <UiIconButton
                                        ref={(element) => {
                                            buttonRef.current = element;
                                        }}
                                        size="medium"
                                        variant="tertiary"
                                        label={intl.formatMessage({
                                            id: "gd.gen-ai.conversations.menu.aria-label",
                                        })}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            toggleDropdown();
                                        }}
                                        accessibilityConfig={{
                                            ...accessibilityConfig,
                                            ariaLabel: intl.formatMessage({
                                                id: "gd.gen-ai.conversations.menu.aria-label",
                                            }),
                                            ariaExpanded: ariaAttributes["aria-expanded"],
                                            ariaHaspopup: "menu",
                                            ariaControls: ariaAttributes["aria-controls"],
                                        }}
                                        tabIndex={-1}
                                        icon="ellipsis"
                                    />
                                )}
                                renderBody={({ closeDropdown, ariaAttributes }) => (
                                    <UiMenu
                                        shouldCloseOnSelect
                                        items={[
                                            {
                                                type: "interactive",
                                                id: "rename",
                                                stringTitle: intl.formatMessage({
                                                    id: "gd.gen-ai.conversations.menu.rename",
                                                }),
                                                isDisabled: conversation.generatingTitle,
                                                iconLeft: <UiIcon type="pencil" size={14} />,
                                                data: {
                                                    ...conversation,
                                                    action: "rename",
                                                },
                                            },
                                            {
                                                type: "interactive",
                                                id: conversation.pinned ? "unpin" : "pin",
                                                stringTitle: conversation.pinned
                                                    ? intl.formatMessage({
                                                          id: "gd.gen-ai.conversations.menu.unpin",
                                                      })
                                                    : intl.formatMessage({
                                                          id: "gd.gen-ai.conversations.menu.pin",
                                                      }),
                                                iconLeft: conversation.pinned ? (
                                                    <UiIcon type="unpin" size={14} />
                                                ) : (
                                                    <UiIcon type="pin" size={14} />
                                                ),
                                                data: conversation,
                                            },
                                            {
                                                type: "static",
                                                id: "delete-separator",
                                                data: (
                                                    <div className="gd-gen-ai-chat__window__conversations__divider_menu" />
                                                ),
                                            },
                                            {
                                                type: "interactive",
                                                id: "delete",
                                                stringTitle: intl.formatMessage({
                                                    id: "gd.gen-ai.conversations.delete-dialog.submit",
                                                }),
                                                isDestructive: true,
                                                iconLeft: <UiIcon type="trash" size={14} />,
                                                data: {
                                                    ...conversation,
                                                    action: "delete",
                                                },
                                            },
                                        ]}
                                        onSelect={(item, event) => {
                                            const selectedConversation =
                                                item.data as IChatConversationLocal & {
                                                    action?: "delete" | "rename";
                                                };
                                            if (selectedConversation.action === "delete") {
                                                setConversationToDelete(conversation);
                                            } else if (selectedConversation.action === "rename") {
                                                setConversationToRename(conversation);
                                            } else {
                                                pinConversation({
                                                    conversationId: selectedConversation.localId,
                                                    pinned: !selectedConversation.pinned,
                                                });
                                            }
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }}
                                        onClose={closeDropdown}
                                        ariaAttributes={ariaAttributes}
                                    />
                                )}
                                closeOnEscape
                                autofocusOnOpen
                            />
                        </div>
                    ),
                    isSelected: isConversationWithLocalId(currentConversation, conversation.localId),
                })),
            })),
        [
            groupedConversations,
            intl,
            catalogItems,
            openedId,
            currentConversation,
            pinConversation,
            setConversationToRename,
        ],
    );

    const draggedConversation = useMemo(
        () => conversations?.find((conversation) => conversation.localId === draggedConversationId),
        [conversations, draggedConversationId],
    );

    const handleDeleteCancel = useCallback(() => {
        setConversationToDelete(undefined);
    }, []);

    const handleRenameCancel = useCallback(() => {
        setConversationToRename(undefined);
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
            deleteConversation({ conversationId: conversationToDelete.localId });
        }
        setConversationToDelete(undefined);
    }, [conversationToDelete, deleteConversation]);

    const handleRenameSubmit = useCallback(
        (title: string) => {
            if (conversationToRename) {
                renameConversation({
                    conversationId: conversationToRename.localId,
                    title,
                });
            }
            setConversationToRename(undefined);
        },
        [conversationToRename, renameConversation],
    );

    const handleDragStart = useCallback((conversationId: string, event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", conversationId);
        setDraggedConversationId(conversationId);
        setActiveDropZone("body");
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedConversationId(undefined);
        setActiveDropZone(undefined);
    }, []);

    const handleDropZoneDragOver = useCallback(
        (dropZone: ConversationDropZone, event: DragEvent<HTMLDivElement>) => {
            if (!draggedConversation) {
                return;
            }

            const canDrop = dropZone === "pin" ? !draggedConversation.pinned : draggedConversation.pinned;
            if (!canDrop) {
                return;
            }

            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setActiveDropZone(dropZone);
        },
        [draggedConversation],
    );

    const handleDropZoneDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        const nextTarget = event.relatedTarget as Node | null;

        if (nextTarget && event.currentTarget.contains(nextTarget)) {
            return;
        }

        setActiveDropZone("body");
    }, []);

    const handleDropZoneDrop = useCallback(
        (dropZone: ConversationDropZone, event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            if (!draggedConversation) {
                return;
            }

            const shouldBePinned = dropZone === "pin";
            if (draggedConversation.pinned !== shouldBePinned) {
                pinConversation({
                    conversationId: draggedConversation.localId,
                    pinned: shouldBePinned,
                });
            }

            setDraggedConversationId(undefined);
            setActiveDropZone(undefined);
        },
        [draggedConversation, pinConversation],
    );

    const handleMenuUnhandledKeyDown = useCallback(
        (event: KeyboardEvent, { focusedItem }: { focusedItem?: IUiMenuItem }) => {
            if (event.key === "Delete" && focusedItem) {
                event.preventDefault();
                event.stopPropagation();
                setConversationToDelete(focusedItem.data as IChatConversationLocal);
            }
        },
        [],
    );

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
                    <DrawerContent
                        openedId={openedId}
                        menuItems={menuItems}
                        conversations={conversations ?? []}
                        handleSelect={handleSelect}
                        draggedConversation={draggedConversation}
                        activeDropZone={activeDropZone}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDropZoneDragOver={handleDropZoneDragOver}
                        onDropZoneDragLeave={handleDropZoneDragLeave}
                        onDropZoneDrop={handleDropZoneDrop}
                        onMenuUnhandledKeyDown={handleMenuUnhandledKeyDown}
                    />
                </div>
            </UiDrawer>
            {conversationToDelete ? (
                <ConversationDeleteDialog
                    conversation={conversationToDelete}
                    onClose={handleDeleteCancel}
                    onDelete={handleDeleteSubmit}
                />
            ) : null}
            {conversationToRename ? (
                <ConversationRenameDialog
                    conversation={conversationToRename}
                    onClose={handleRenameCancel}
                    onRename={handleRenameSubmit}
                />
            ) : null}
        </>
    );
}

interface IDrawerContentProps {
    openedId: string | undefined;
    conversations: IChatConversationLocal[];
    menuItems: IUiMenuItem[];
    handleSelect: (conversation: IChatConversationLocal) => void;
    draggedConversation: IChatConversationLocal | undefined;
    activeDropZone: ConversationDropZone | undefined;
    onDragStart: (conversationId: string, event: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    onDropZoneDragOver: (dropZone: ConversationDropZone, event: DragEvent<HTMLDivElement>) => void;
    onDropZoneDragLeave: (event: DragEvent<HTMLDivElement>) => void;
    onDropZoneDrop: (dropZone: ConversationDropZone, event: DragEvent<HTMLDivElement>) => void;
    onMenuUnhandledKeyDown: (event: KeyboardEvent, context: { focusedItem?: IUiMenuItem }) => void;
}

function DrawerContent({
    openedId,
    conversations,
    menuItems,
    handleSelect,
    draggedConversation,
    activeDropZone,
    onDragStart,
    onDragEnd,
    onDropZoneDragOver,
    onDropZoneDragLeave,
    onDropZoneDrop,
    onMenuUnhandledKeyDown,
}: IDrawerContentProps) {
    const intl = useIntl();

    const pinnedItems = useMemo(() => {
        return menuItems.filter((item) => item.id === ConversationDateGroup.PINNED);
    }, [menuItems]);

    const restItems = useMemo(() => {
        return menuItems.filter((item) => item.id !== ConversationDateGroup.PINNED);
    }, [menuItems]);

    return (
        <>
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
                    <div
                        className="gd-gen-ai-chat__window__conversations__drop-group"
                        onDragLeave={onDropZoneDragLeave}
                        onDragOver={(event) => onDropZoneDragOver("pin", event)}
                        onDrop={(event) => onDropZoneDrop("pin", event)}
                    >
                        <div
                            className={cx("gd-gen-ai-chat__window__conversations__drop-placeholder", {
                                isDragging: activeDropZone === "body" && !draggedConversation?.pinned,
                                isDraggingOver: activeDropZone === "pin",
                                isEmpty: pinnedItems.length === 0,
                            })}
                        >
                            <div className="gd-gen-ai-chat__window__conversations__drop-placeholder__content">
                                {intl.formatMessage({
                                    id: "gd.gen-ai.conversations.dnd.pin-placeholder",
                                })}
                            </div>
                        </div>
                        <ConversationsList
                            id="gd-gen-ai-conversations-pinned"
                            openedId={openedId}
                            listItems={pinnedItems}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onMenuUnhandledKeyDown={onMenuUnhandledKeyDown}
                            handleSelect={handleSelect}
                        />
                    </div>
                    <div
                        className="gd-gen-ai-chat__window__conversations__drop-group"
                        onDragOver={(event) => onDropZoneDragOver("unpin", event)}
                        onDragLeave={onDropZoneDragLeave}
                        onDrop={(event) => onDropZoneDrop("unpin", event)}
                    >
                        <div
                            className={cx("gd-gen-ai-chat__window__conversations__drop-placeholder", {
                                isDragging: activeDropZone === "body" && draggedConversation?.pinned,
                                isDraggingOver: activeDropZone === "unpin",
                            })}
                        >
                            <div className="gd-gen-ai-chat__window__conversations__drop-placeholder__content">
                                {intl.formatMessage({
                                    id: "gd.gen-ai.conversations.dnd.unpin-placeholder",
                                })}
                            </div>
                        </div>
                        <ConversationsList
                            id="gd-gen-ai-conversations-rest"
                            openedId={openedId}
                            listItems={restItems}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onMenuUnhandledKeyDown={onMenuUnhandledKeyDown}
                            handleSelect={handleSelect}
                        />
                    </div>
                    {draggedConversation ? (
                        <div
                            className={cx("gd-gen-ai-chat__window__conversations__drop-overlay", {
                                isDragging: !!activeDropZone,
                            })}
                        />
                    ) : null}
                </div>
            )}
        </>
    );
}

interface IConversationListProps {
    id: string;
    openedId: string | undefined;
    listItems: IUiMenuItem[];
    onDragStart: (conversationId: string, event: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    onMenuUnhandledKeyDown: (event: KeyboardEvent, context: { focusedItem?: IUiMenuItem }) => void;
    handleSelect: (conversation: IChatConversationLocal) => void;
}

function ConversationsList({
    id,
    openedId,
    listItems,
    handleSelect,
    onDragStart,
    onDragEnd,
    onMenuUnhandledKeyDown,
}: IConversationListProps) {
    const intl = useIntl();

    return useMemo(() => {
        return (
            <UiMenu
                onUnhandledKeyDown={onMenuUnhandledKeyDown}
                InteractiveItemWrapper={(props) => (
                    <DraggableConversationItem
                        {...props}
                        intl={intl}
                        openedId={openedId}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                    />
                )}
                items={listItems}
                onSelect={(item, event) => {
                    handleSelect(item.data as IChatConversationLocal);
                    event.stopPropagation();
                    event.preventDefault();
                }}
                shouldCloseOnSelect={false}
                size="small"
                ariaAttributes={{
                    id,
                    "aria-label": intl.formatMessage({ id: "gd.gen-ai.conversations.title" }),
                }}
            />
        );
    }, [id, handleSelect, intl, listItems, onDragEnd, onDragStart, onMenuUnhandledKeyDown, openedId]);
}

type DraggableConversationItemProps = Parameters<typeof DefaultUiMenuInteractiveItemWrapper>[0] & {
    intl: ReturnType<typeof useIntl>;
    openedId: string | undefined;
    onDragStart: (conversationId: string, event: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
};

function DraggableConversationItem(props: DraggableConversationItemProps) {
    const data = props.item.data as IChatConversationLocal;
    const itemTitle = props.item.stringTitle || generateTemporaryTitle(props.intl, data);

    return (
        <div
            draggable
            title={itemTitle}
            className={cx("gd-gen-ai-chat__window__conversations__list__item", {
                generatingTitle: data.generatingTitle,
                inProgress: data.inProgress,
                openedMenu: props.openedId === props.item.id,
            })}
            onDragStart={(event) => {
                event.currentTarget.classList.add("dragging");
                props.onDragStart(data.localId, event);
            }}
            onDragEnd={(event) => {
                event.currentTarget.classList.remove("dragging");
                props.onDragEnd();
            }}
        >
            <DefaultUiMenuInteractiveItemWrapper
                {...props}
                item={{
                    ...props.item,
                    stringTitle: itemTitle,
                }}
            />
        </div>
    );
}

const mapStateToProps = (state: RootState): GenAIChatConversationsStateProps => ({
    conversation: conversationSelector(state),
    conversations: conversationsSelector(state),
});

const mapDispatchToProps: GenAIChatConversationsDispatchProps = {
    setHistory: setHistoryAction,
    deleteConversation: deleteConversationAction,
    pinConversation: pinConversationAction,
    renameConversation: renameConversationAction,
    loadConversation: setCurrentConversationAction,
};

export const GenAIChatConversations: FC = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAIChatConversationsComponent);

function getConversationGroupLabel(group: ConversationDateGroup, intl: ReturnType<typeof useIntl>): string {
    switch (group) {
        case ConversationDateGroup.PINNED:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.pinned" });
        case ConversationDateGroup.TODAY:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.today" });
        case ConversationDateGroup.LAST_7_DAYS:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.last-7-days" });
        case ConversationDateGroup.OLDER:
        default:
            return intl.formatMessage({ id: "gd.gen-ai.conversations.group.older" });
    }
}
