// (C) 2026 GoodData Corporation

import {
    type DragEvent,
    type FC,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
    type RefObject,
    cloneElement,
    useCallback,
    useEffect,
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
    type IUiMenuFocusableItem,
    type IUiMenuItem,
    UiDrawer,
    UiIcon,
    UiIconButton,
    UiMenu,
    UiSkeleton,
} from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocal } from "../model.js";
import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import {
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
} from "../store/messages/messagesSelectors.js";
import {
    deleteConversationAction,
    pinConversationAction,
    renameConversationAction,
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
    deleteConversation: typeof deleteConversationAction;
    pinConversation: typeof pinConversationAction;
    renameConversation: typeof renameConversationAction;
};

type GenAIChatConversationsExternalProps = {
    wrapper?: ReactElement;
    onClose?: () => void;
    onSelect: (conversation: IChatConversationLocal) => void;
};

export type GenAIChatConversationsProps = GenAIChatConversationsStateProps &
    GenAIChatConversationsDispatchProps &
    GenAIChatConversationsExternalProps;

type ConversationDropZone = "pin" | "unpin" | "body";

function GenAIChatConversationsComponent({
    onClose,
    onSelect,
    wrapper,
    deleteConversation,
    pinConversation,
    renameConversation,
    conversations,
    conversation: currentConversation,
}: GenAIChatConversationsProps) {
    const menuRef = useRef<HTMLElement>(undefined);
    const intl = useIntl();

    const { isFullscreen, isSmallScreen } = useFullscreenCheck();
    const { isHistory } = useHistoryCheck();
    const [conversationToDelete, setConversationToDelete] = useState<IChatConversationLocal | undefined>();
    const [conversationToRename, setConversationToRename] = useState<IChatConversationLocal | undefined>();
    const [openedId, setOpenedId] = useState<string | undefined>();
    const [draggedConversationId, setDraggedConversationId] = useState<string | undefined>();
    const [activeDropZone, setActiveDropZone] = useState<ConversationDropZone | undefined>();

    const catalogItems = useSelector(catalogItemsSelector);
    const conversationLoaded = useSelector(conversationsLoadedSelector);

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
                                returnFocusTo={menuRef as RefObject<HTMLDivElement>}
                                onToggle={() => {
                                    setOpenedId(openedId ? undefined : conversation.localId);
                                }}
                                isOpen={openedId === conversation.localId}
                                alignPoints={[
                                    { align: "bl tl" },
                                    { align: "br tr" },
                                    { align: "tl bl" },
                                    { align: "tr br" },
                                ]}
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
                                                type: "separator",
                                                id: "delete-separator",
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
                                                    conversation: selectedConversation,
                                                    pinned: !selectedConversation.pinned,
                                                });
                                            }
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }}
                                        size="medium"
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
        menuRef.current?.focus();
    }, []);

    const handleRenameCancel = useCallback(() => {
        setConversationToRename(undefined);
        menuRef.current?.focus();
    }, []);

    const handleSelect = useCallback(
        (conversation: IChatConversationLocal) => {
            onSelect(conversation);
            onClose?.();
        },
        [onSelect, onClose],
    );

    const handleDeleteSubmit = useCallback(() => {
        if (conversationToDelete) {
            deleteConversation({ conversation: conversationToDelete });
        }
        setConversationToDelete(undefined);
        menuRef.current?.focus();
    }, [conversationToDelete, deleteConversation]);

    const handleRenameSubmit = useCallback(
        (title: string) => {
            if (conversationToRename) {
                renameConversation({
                    conversation: conversationToRename,
                    title,
                });
            }
            setConversationToRename(undefined);
            menuRef.current?.focus();
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
                    conversation: draggedConversation,
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
            if (event.key === "Delete" && focusedItem?.type === "interactive") {
                event.preventDefault();
                event.stopPropagation();
                setConversationToDelete(focusedItem.data as IChatConversationLocal);
            }
        },
        [],
    );

    const Component = wrapper ?? <DrawerComponent onClose={onClose} />;

    return (
        <>
            {cloneElement(
                Component,
                {},
                <div
                    className={cx("gd-gen-ai-chat__window__conversations", {
                        "gd-gen-ai-chat__window__conversations--isFullscreen": isFullscreen,
                        "gd-gen-ai-chat__window__conversations--isSmallScreen": isSmallScreen,
                    })}
                >
                    <DrawerContent
                        isOpen={isHistory}
                        openedId={openedId}
                        conversationLoaded={conversationLoaded}
                        selectedId={currentConversation?.localId}
                        menuRef={menuRef}
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
                </div>,
            )}
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

interface IDrawerComponentProps {
    onClose?: () => void;
    children?: ReactNode;
}

function DrawerComponent({ onClose, children }: IDrawerComponentProps) {
    const ref = useRef<HTMLElement>(undefined);
    const { isHistory } = useHistoryCheck();
    const intl = useIntl();

    return (
        <>
            <div className="gd-gen-ai-chat__window__drawer" ref={ref as RefObject<HTMLDivElement>}></div>
            <UiDrawer
                anchor="left"
                closeButtonSize="medium"
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
                onClickClose={onClose}
                onClickOutside={onClose}
            >
                {children}
            </UiDrawer>
        </>
    );
}

interface IDrawerContentProps {
    isOpen: boolean;
    conversationLoaded: boolean;
    openedId: string | undefined;
    selectedId: string | undefined;
    menuRef: RefObject<HTMLElement | undefined>;
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
    isOpen,
    openedId,
    selectedId,
    menuRef,
    conversations,
    menuItems,
    handleSelect,
    draggedConversation,
    conversationLoaded,
    activeDropZone,
    onDragStart,
    onDragEnd,
    onDropZoneDragOver,
    onDropZoneDragLeave,
    onDropZoneDrop,
    onMenuUnhandledKeyDown,
}: IDrawerContentProps) {
    const intl = useIntl();
    const conversationsListRef = useRef<HTMLDivElement>(null);

    const pinnedItems = useMemo(() => {
        return menuItems.filter((item) => item.id === ConversationDateGroup.PINNED);
    }, [menuItems]);

    const restItems = useMemo(() => {
        return menuItems.filter((item) => item.id !== ConversationDateGroup.PINNED);
    }, [menuItems]);

    useEffect(() => {
        if (!isOpen || !selectedId || !conversationLoaded) {
            return;
        }

        const selectedItem = conversationsListRef.current?.querySelector<HTMLElement>(
            `[data-conversation-id="${selectedId}"]`,
        );
        selectedItem?.scrollIntoView({ block: "nearest" });
    }, [isOpen, selectedId, menuItems, conversationLoaded]);

    if (!conversationLoaded) {
        return <UiSkeleton itemsCount={3} itemWidth="auto" itemHeight={20} itemsGap={8} />;
    }

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
                <div className="gd-gen-ai-chat__window__conversations__list" ref={conversationsListRef}>
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
                            menuRef={menuRef}
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
                            menuRef={menuRef}
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
    menuRef: RefObject<HTMLElement | undefined>;
    openedId: string | undefined;
    listItems: IUiMenuItem[];
    onDragStart: (conversationId: string, event: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
    onMenuUnhandledKeyDown: (event: KeyboardEvent, context: { focusedItem?: IUiMenuItem }) => void;
    handleSelect: (conversation: IChatConversationLocal) => void;
}

function ConversationsList({
    id,
    menuRef,
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
                onEnterLevel={(item, event) => {
                    toggleInConversationItems(menuRef, item, event);
                    return true;
                }}
                onLeaveLevel={(item, event) => {
                    toggleInConversationItems(menuRef, item, event);
                    return true;
                }}
                shouldCloseOnSelect={false}
                size="medium"
                ariaAttributes={{
                    id,
                    "aria-label": intl.formatMessage({ id: "gd.gen-ai.conversations.title" }),
                }}
            />
        );
    }, [
        id,
        handleSelect,
        intl,
        listItems,
        onDragEnd,
        onDragStart,
        onMenuUnhandledKeyDown,
        openedId,
        menuRef,
    ]);
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
            data-conversation-id={data.localId}
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

function toggleInConversationItems(
    menuRef: RefObject<HTMLElement | undefined>,
    item: IUiMenuFocusableItem | undefined,
    event: MouseEvent | KeyboardEvent,
) {
    if (!item) {
        return;
    }
    const conv = item.data as IChatConversationLocal;
    const target = event.currentTarget as HTMLElement;
    const element = target.querySelector(`[data-conversation-id="${conv.localId}"]`);
    const button = element?.querySelector("button");
    if (button && button !== document.activeElement) {
        button.focus();
    } else {
        target.focus();
    }
    menuRef.current = target;
}

const mapStateToProps = (state: RootState): GenAIChatConversationsStateProps => ({
    conversation: conversationSelector(state),
    conversations: conversationsSelector(state),
});

const mapDispatchToProps: GenAIChatConversationsDispatchProps = {
    deleteConversation: deleteConversationAction,
    pinConversation: pinConversationAction,
    renameConversation: renameConversationAction,
};

export const GenAIChatConversations: FC<GenAIChatConversationsExternalProps> = connect(
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
