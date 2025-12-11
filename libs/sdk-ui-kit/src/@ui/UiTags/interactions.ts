// (C) 2025 GoodData Corporation

import { MutableRefObject, useCallback, useMemo, useRef, useState } from "react";

import { UiTagDef, UiTagsProps } from "./types.js";
import { makeTabsKeyboardNavigation } from "../@utils/keyboardNavigation.js";

type InteractionState = {
    moreOpen: boolean;
    addOpen: boolean;
    tags: Record<string, HTMLButtonElement>;
    more: HTMLButtonElement | null;
    add: HTMLButtonElement | null;
    close: HTMLButtonElement | null;
    save: HTMLButtonElement | null;
    input: HTMLInputElement | null;
};

export function useTagsInteractions(
    rootRef: MutableRefObject<HTMLDivElement | null>,
    hiddenTagsRef: MutableRefObject<HTMLDivElement | null>,
    showedTags: UiTagDef[],
    hiddenTags: UiTagDef[],
    onTagClick: UiTagsProps["onTagClick"],
    onTagAdd: UiTagsProps["onTagAdd"],
    onTagRemove: UiTagsProps["onTagRemove"],
) {
    const [tag, setTag] = useState<string>("");
    const [showedFocusedIndex, setShowedFocusedIndex] = useState(0);
    const [hiddenFocusedIndex, setHiddenFocusedIndex] = useState(0);

    const rootItems = useMemo(() => {
        return [...showedTags, ...(hiddenTags.length > 0 ? [hiddenTags] : [])];
    }, [showedTags, hiddenTags]);

    const interactionState = useRef<InteractionState>({
        moreOpen: false,
        addOpen: false,
        tags: {},
        more: null,
        add: null,
        close: null,
        save: null,
        input: null,
    });

    const onMoreOpen = useCallback(() => {
        interactionState.current.moreOpen = true;
        setShowedFocusedIndex(rootItems.length - 1);
        setHiddenFocusedIndex(0);
    }, [rootItems]);
    const onMoreClose = useCallback(() => {
        interactionState.current.moreOpen = false;
        setShowedFocusedIndex(rootItems.length - 1);
        setHiddenFocusedIndex(0);
    }, [rootItems]);

    const onAddOpen = useCallback(() => {
        interactionState.current.addOpen = true;
    }, []);
    const onAddClose = useCallback(() => {
        interactionState.current.addOpen = false;
    }, []);

    const onTagAddHandler = useCallback(() => {
        if (!tag) {
            return;
        }
        onTagAdd?.({ id: tag, label: tag });
        setTag("");
    }, [tag, onTagAdd]);

    const onTagRemoveHandler = useCallback(
        (tag: UiTagDef) => {
            const deletedShowedTag = showedTags.findIndex((t) => t === tag);
            const deletedHiddenTag = hiddenTags.findIndex((t) => t === tag);
            if (deletedShowedTag !== -1) {
                setShowedFocusedIndex(Math.min(deletedShowedTag, showedTags.length - 1));
            }
            if (deletedHiddenTag !== -1) {
                setHiddenFocusedIndex(Math.min(deletedHiddenTag, hiddenTags.length - 1));
            }
            onTagRemove?.(tag);
        },
        [hiddenTags, onTagRemove, showedTags],
    );
    const onTagClickHandler = useCallback(
        (tag: UiTagDef) => {
            const showedTag = showedTags.findIndex((t) => t === tag);
            if (showedTag !== -1) {
                setShowedFocusedIndex(showedTag);
            }

            const hiddenTag = hiddenTags.findIndex((t) => t === tag);
            if (hiddenTag !== -1) {
                setHiddenFocusedIndex(hiddenTag);
            }

            onTagClick?.(tag);
        },
        [hiddenTags, onTagClick, showedTags],
    );

    const handleKeyDown = useMemo(
        () =>
            makeTabsKeyboardNavigation(
                {
                    onFocusPrevious: (event) => {
                        if (interactionState.current.addOpen) {
                            return;
                        }
                        if (event.target === interactionState.current.add) {
                            return;
                        }

                        if (interactionState.current.moreOpen) {
                            hiddenTagsRef.current?.focus();
                            if (hiddenFocusedIndex === 0) {
                                setHiddenFocusedIndex(hiddenTags.length - 1);
                            } else {
                                setHiddenFocusedIndex(
                                    Math.min(hiddenFocusedIndex - 1, hiddenTags.length - 1),
                                );
                            }
                        } else {
                            rootRef.current?.focus();
                            if (showedFocusedIndex === 0) {
                                setShowedFocusedIndex(rootItems.length - 1);
                            } else {
                                setShowedFocusedIndex(
                                    Math.min(showedFocusedIndex - 1, showedTags.length - 1),
                                );
                            }
                        }
                    },
                    onFocusNext: (event) => {
                        if (interactionState.current.addOpen) {
                            return;
                        }
                        if (event.target === interactionState.current.add) {
                            return;
                        }

                        if (interactionState.current.moreOpen) {
                            hiddenTagsRef.current?.focus();
                            if (hiddenTags.length - 1 <= hiddenFocusedIndex) {
                                setHiddenFocusedIndex(0);
                            } else {
                                setHiddenFocusedIndex(hiddenFocusedIndex + 1);
                            }
                        } else {
                            rootRef.current?.focus();
                            if (rootItems.length - 1 <= showedFocusedIndex) {
                                setShowedFocusedIndex(0);
                            } else {
                                setShowedFocusedIndex(showedFocusedIndex + 1);
                            }
                        }
                    },
                    onFocusFirst: (event) => {
                        if (interactionState.current.addOpen) {
                            return;
                        }
                        if (event.target === interactionState.current.add) {
                            return;
                        }
                        if (interactionState.current.moreOpen) {
                            hiddenTagsRef.current?.focus();
                            setHiddenFocusedIndex(0);
                        } else {
                            rootRef.current?.focus();
                            setShowedFocusedIndex(0);
                        }
                    },
                    onFocusLast: (event) => {
                        if (interactionState.current.addOpen) {
                            return;
                        }
                        if (event.target === interactionState.current.add) {
                            return;
                        }
                        if (interactionState.current.moreOpen) {
                            hiddenTagsRef.current?.focus();
                            setHiddenFocusedIndex(hiddenTags.length - 1);
                        } else {
                            rootRef.current?.focus();
                            setShowedFocusedIndex(rootItems.length - 1);
                        }
                    },
                    onSelect: (event) => {
                        const { button, input } = loadActiveElement(
                            interactionState,
                            event.target as HTMLElement,
                        );

                        if (button) {
                            button.click();
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }

                        // Do not handle any select if add is open
                        if (input) {
                            event.stopPropagation();
                            return;
                        }

                        // Tags
                        if (interactionState.current.moreOpen) {
                            const item = loadActiveTag(
                                interactionState,
                                hiddenTags,
                                hiddenFocusedIndex,
                                false,
                            );

                            if (item) {
                                item.click();
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        } else {
                            const item = loadActiveTag(
                                interactionState,
                                showedTags,
                                showedFocusedIndex,
                                true,
                            );

                            if (item) {
                                item.click();
                                event.preventDefault();
                                event.stopPropagation();
                            }
                        }
                    },
                    onUnhandledKeyDown: (event) => {
                        //Delete
                        if (event.key === "Backspace" || event.key === "Delete") {
                            const { button, input } = loadActiveElement(
                                interactionState,
                                event.target as HTMLElement,
                            );

                            if (button || input) {
                                return;
                            }

                            if (interactionState.current.moreOpen) {
                                const item = loadActiveTag(
                                    interactionState,
                                    hiddenTags,
                                    hiddenFocusedIndex,
                                    false,
                                );

                                if (item) {
                                    onTagRemoveHandler(hiddenTags[hiddenFocusedIndex]);
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            } else {
                                const item = loadActiveTag(
                                    interactionState,
                                    showedTags,
                                    showedFocusedIndex,
                                    false,
                                );

                                if (item) {
                                    onTagRemoveHandler(showedTags[showedFocusedIndex]);
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                        }
                    },
                },
                {
                    shouldPreventDefault: false,
                    shouldStopPropagation: false,
                },
            ),
        [
            hiddenTagsRef,
            hiddenFocusedIndex,
            hiddenTags,
            rootRef,
            showedFocusedIndex,
            rootItems.length,
            showedTags,
            onTagRemoveHandler,
        ],
    );

    return {
        tag,
        setTag,
        onAddOpen,
        onAddClose,
        onMoreOpen,
        onMoreClose,
        handleKeyDown,
        interactionState,
        showedFocusedIndex,
        hiddenFocusedIndex,
        onTagAddHandler,
        onTagRemoveHandler,
        onTagClickHandler,
    };
}

function loadActiveTag(
    interactionState: MutableRefObject<InteractionState>,
    tags: UiTagDef[],
    index: number,
    allowMore: boolean,
) {
    // More
    if (index === tags.length) {
        if (!allowMore) {
            return null;
        }
        const more = interactionState.current.more;
        if (more) {
            return more;
        }
        return null;
    }
    // Tag
    const tag = tags[index];
    const item = interactionState.current.tags[tag?.id];
    if (item) {
        return item;
    }
    return null;
}

function loadActiveElement(interactionState: MutableRefObject<InteractionState>, target?: HTMLElement) {
    const buttons = [
        interactionState.current.add,
        interactionState.current.close,
        interactionState.current.save,
    ];

    const button = buttons.find((b) => b === target);
    if (button) {
        return { button };
    }

    // Do not handle any select if add is open
    if (target === interactionState.current.input) {
        return { input: interactionState.current.input };
    }

    return {};
}
