// (C) 2025 GoodData Corporation

import React from "react";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { makeLinearKeyboardNavigation, makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";

/**
 * @internal
 */
export const SELECT_ITEM_ACTION = "selectItem";

interface IKeyboardNavigationDeps<Item, Action extends string> {
    items: Item[];
    focusedAction: Action | typeof SELECT_ITEM_ACTION;
    focusedItemAdditionalActions: Action[];
    focusedItem: Item | undefined;
    actionHandlers: {
        [key in Action | typeof SELECT_ITEM_ACTION]: (
            item: Item,
            e?: React.KeyboardEvent,
        ) => (() => void) | undefined;
    };
    setFocusedIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
    setFocusedAction: React.Dispatch<React.SetStateAction<Action | typeof SELECT_ITEM_ACTION>>;
}

/**
 * @internal
 */
export function useListWithActionsKeyboardNavigation<Item, Action extends string>({
    items,
    actionHandlers,
    getItemAdditionalActions,
    isNestedList = false,
    focusedIndex: focusedIndexProp,
}: {
    items: Item[];
    actionHandlers: {
        [key in Action | typeof SELECT_ITEM_ACTION]: (
            item: Item,
            e?: React.KeyboardEvent,
        ) => (() => void) | undefined;
    };
    getItemAdditionalActions: (item: Item) => Action[];
    isNestedList?: boolean;
    focusedIndex?: number;
}) {
    const [focusedIndex, setFocusedIndex] = React.useState<number | undefined>(focusedIndexProp ?? 0);
    const focusedItem = focusedIndex === undefined ? undefined : items[focusedIndex];

    const [focusedAction, setFocusedAction] = React.useState<Action | typeof SELECT_ITEM_ACTION>(
        SELECT_ITEM_ACTION,
    );

    React.useEffect(() => {
        if (focusedIndexProp !== undefined) {
            setFocusedIndex(focusedIndexProp);
        }
    }, [focusedIndexProp]);

    const focusedItemAdditionalActions = React.useMemo(
        () => (focusedItem ? getItemAdditionalActions(focusedItem) : []),
        [focusedItem, getItemAdditionalActions],
    );

    // If the items change and we're suddenly focusing on a nonexistent item
    if (focusedIndex && focusedIndex > items.length - 1) {
        setFocusedIndex(items.length - 1);
    }
    // If the item actions change and we're suddenly focusing on a nonexistent action
    if (focusedAction !== SELECT_ITEM_ACTION && !focusedItemAdditionalActions.includes(focusedAction)) {
        setFocusedAction(focusedItemAdditionalActions[0] ?? SELECT_ITEM_ACTION);
    }

    const keyboardNavigationDepsRef = useAutoupdateRef<IKeyboardNavigationDeps<Item, Action>>({
        items,
        focusedAction,
        setFocusedIndex,
        setFocusedAction,
        focusedItemAdditionalActions,
        focusedItem,
        actionHandlers,
    });

    // There are two separate modes of control,
    // one switches between items and one controls picking actions for a specific item
    const selectionMode = focusedAction === SELECT_ITEM_ACTION ? "item" : "additionalAction";

    const handleKeyboardNavigation = React.useMemo(() => {
        return selectionMode === "item"
            ? // Selecting items
              makeItemSelectionNavigation(keyboardNavigationDepsRef)
            : // Selecting actions
              makeActionSelectionNavigation(keyboardNavigationDepsRef, isNestedList);
    }, [keyboardNavigationDepsRef, selectionMode, isNestedList]);

    const handleBlur = React.useCallback<React.FocusEventHandler>(() => {
        setFocusedAction(SELECT_ITEM_ACTION);
    }, []);

    return {
        onKeyboardNavigation: handleKeyboardNavigation,
        onBlur: handleBlur,
        focusedAction,
        focusedItem,
        setFocusedAction,
    };
}

function makeItemSelectionNavigation<Item, Action extends string>(
    depsRef: React.MutableRefObject<IKeyboardNavigationDeps<Item, Action>>,
) {
    return makeMenuKeyboardNavigation({
        onFocusPrevious: () => {
            const { items, setFocusedIndex } = depsRef.current;

            setFocusedIndex((currentIndex) =>
                currentIndex === undefined || currentIndex === 0 ? items.length - 1 : currentIndex - 1,
            );
        },
        onFocusNext: () => {
            const { items, setFocusedIndex } = depsRef.current;

            setFocusedIndex((currentIndex) =>
                currentIndex === undefined || currentIndex === items.length - 1 ? 0 : currentIndex + 1,
            );
        },
        onFocusFirst: () => {
            const { setFocusedIndex } = depsRef.current;

            setFocusedIndex(0);
        },
        onFocusLast: () => {
            const { items, setFocusedIndex } = depsRef.current;

            setFocusedIndex(items.length - 1);
        },
        onSelect: (e) => {
            const { actionHandlers, focusedItem } = depsRef.current;

            if (!focusedItem) {
                return;
            }

            actionHandlers.selectItem(focusedItem, e)?.();
        },
        onEnterLevel: () => {
            const { focusedItemAdditionalActions, setFocusedAction } = depsRef.current;

            if (focusedItemAdditionalActions.length === 0) {
                return;
            }

            setFocusedAction(focusedItemAdditionalActions[0]);
        },
    });
}

function makeActionSelectionNavigation<Item, Action extends string>(
    depsRef: React.MutableRefObject<IKeyboardNavigationDeps<Item, Action>>,
    isNestedList: boolean,
) {
    return makeLinearKeyboardNavigation({
        onFocusPrevious: (e) => {
            const { items, focusedItemAdditionalActions, setFocusedIndex, setFocusedAction } =
                depsRef.current;
            if (isNestedList && e.key === "ArrowUp") {
                setFocusedIndex((currentIndex) =>
                    currentIndex === undefined || currentIndex === 0 ? items.length - 1 : currentIndex - 1,
                );
                setFocusedAction(SELECT_ITEM_ACTION);

                return;
            }

            setFocusedAction((currentAction) => {
                if (currentAction === SELECT_ITEM_ACTION) {
                    return currentAction;
                }

                return (
                    focusedItemAdditionalActions[focusedItemAdditionalActions.indexOf(currentAction) - 1] ??
                    focusedItemAdditionalActions.at(-1) ??
                    SELECT_ITEM_ACTION
                );
            });
        },
        onFocusNext: (e) => {
            const { items, focusedItemAdditionalActions, setFocusedIndex, setFocusedAction } =
                depsRef.current;

            if (isNestedList && e.key === "ArrowDown") {
                setFocusedIndex((currentIndex) =>
                    currentIndex === undefined || currentIndex === items.length - 1 ? 0 : currentIndex + 1,
                );
                setFocusedAction(SELECT_ITEM_ACTION);

                return;
            }

            setFocusedAction((currentAction) => {
                if (currentAction === SELECT_ITEM_ACTION) {
                    return currentAction;
                }

                return (
                    focusedItemAdditionalActions[focusedItemAdditionalActions.indexOf(currentAction) + 1] ??
                    focusedItemAdditionalActions[0] ??
                    SELECT_ITEM_ACTION
                );
            });
        },
        onFocusFirst: () => {
            const { focusedItemAdditionalActions, setFocusedAction } = depsRef.current;

            setFocusedAction(focusedItemAdditionalActions[0] ?? SELECT_ITEM_ACTION);
        },
        onFocusLast: () => {
            const { focusedItemAdditionalActions, setFocusedAction } = depsRef.current;

            setFocusedAction(focusedItemAdditionalActions.at(-1) ?? SELECT_ITEM_ACTION);
        },
        onSelect: () => {
            const { actionHandlers, focusedAction, focusedItem } = depsRef.current;

            if (!focusedItem) {
                return;
            }

            actionHandlers[focusedAction](focusedItem)?.();
        },
        onClose: () => {
            const { setFocusedAction } = depsRef.current;

            setFocusedAction(SELECT_ITEM_ACTION);
        },
    });
}
