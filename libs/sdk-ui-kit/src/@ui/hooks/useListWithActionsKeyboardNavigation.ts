// (C) 2025 GoodData Corporation

import {
    Dispatch,
    FocusEventHandler,
    KeyboardEvent,
    MutableRefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import {
    makeGridKeyboardNavigation,
    makeLinearKeyboardNavigation,
    makeMenuKeyboardNavigation,
} from "../@utils/keyboardNavigation.js";

/**
 * @internal
 */
export const SELECT_ITEM_ACTION = "selectItem";

interface IKeyboardNavigationDeps<Item, Action extends string> {
    items: Item[];
    focusedAction: Action | typeof SELECT_ITEM_ACTION;
    focusedItemAdditionalActions: Action[];
    focusedItem: Item | undefined;
    isWrapping: boolean;
    actionHandlers: {
        [key in Action | typeof SELECT_ITEM_ACTION]: (
            item: Item,
            e?: KeyboardEvent,
        ) => (() => void) | undefined;
    };
    setFocusedIndex: Dispatch<SetStateAction<number | undefined>>;
    setFocusedAction: Dispatch<SetStateAction<Action | typeof SELECT_ITEM_ACTION>>;
}

/**
 * @internal
 */
export function useListWithActionsKeyboardNavigation<Item, Action extends string>({
    items,
    actionHandlers,
    getItemAdditionalActions,
    isNestedList = false,
    isSimple = false,
    isWrapping = false,
    focusedIndex: focusedIndexProp,
}: {
    items: Item[];
    actionHandlers: {
        [key in Action | typeof SELECT_ITEM_ACTION]: (
            item: Item,
            e?: KeyboardEvent,
        ) => (() => void) | undefined;
    };
    getItemAdditionalActions: (item: Item) => Action[];
    isNestedList?: boolean;
    isSimple?: boolean;
    isWrapping?: boolean;
    focusedIndex?: number;
}) {
    const [focusedIndex, setFocusedIndex] = useState<number | undefined>(focusedIndexProp ?? 0);
    const focusedItem = focusedIndex === undefined ? undefined : items[focusedIndex];

    const [focusedAction, setFocusedAction] = useState<Action | typeof SELECT_ITEM_ACTION>(
        SELECT_ITEM_ACTION,
    );

    useEffect(() => {
        if (focusedIndexProp !== undefined) {
            setFocusedIndex(focusedIndexProp);
        }
    }, [focusedIndexProp]);

    const focusedItemAdditionalActions = useMemo(
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
        isWrapping,
    });

    // There are two separate modes of control,
    // one switches between items and one controls picking actions for a specific item
    const selectionMode = isSimple
        ? "simple"
        : focusedAction === SELECT_ITEM_ACTION
          ? "item"
          : "additionalAction";

    const handleKeyboardNavigation = useMemo(() => {
        switch (selectionMode) {
            case "simple":
                return makeSimpleSelectionNavigation(keyboardNavigationDepsRef);
            case "item": // Selecting items
                return makeItemSelectionNavigation(keyboardNavigationDepsRef);
            case "additionalAction": // Selecting actions
                return makeActionSelectionNavigation(keyboardNavigationDepsRef, isNestedList);
        }
    }, [keyboardNavigationDepsRef, selectionMode, isNestedList]);

    const handleBlur = useCallback<FocusEventHandler>(() => {
        setFocusedAction(SELECT_ITEM_ACTION);
    }, []);

    return {
        onKeyboardNavigation: handleKeyboardNavigation,
        onBlur: handleBlur,
        focusedAction,
        focusedItem,
        setFocusedAction,
        setFocusedIndex,
    };
}

function makeSimpleSelectionNavigation<Item, Action extends string>(
    depsRef: MutableRefObject<IKeyboardNavigationDeps<Item, Action>>,
) {
    return makeGridKeyboardNavigation({
        onFocusUp: () => {
            const { items, setFocusedIndex, setFocusedAction, isWrapping } = depsRef.current;

            setFocusedIndex((currentIndex) => {
                if (!isWrapping) {
                    return Math.max(0, (currentIndex ?? 0) - 1);
                }

                return currentIndex === undefined || currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            });
            setFocusedAction(SELECT_ITEM_ACTION);
        },
        onFocusDown: () => {
            const { items, setFocusedIndex, setFocusedAction, isWrapping } = depsRef.current;

            setFocusedIndex((currentIndex) => {
                if (!isWrapping) {
                    return Math.min(items.length - 1, (currentIndex ?? items.length) + 1);
                }

                return currentIndex === undefined || currentIndex === items.length - 1 ? 0 : currentIndex + 1;
            });
            setFocusedAction(SELECT_ITEM_ACTION);
        },
        onFocusLeft: () => {
            const { setFocusedAction, focusedItemAdditionalActions } = depsRef.current;

            setFocusedAction((currentAction) => {
                const actions = [SELECT_ITEM_ACTION, ...focusedItemAdditionalActions] satisfies Array<
                    typeof currentAction
                >;

                const currentActionIndex = actions.indexOf(currentAction);
                const newIndex = (actions.length + currentActionIndex - 1) % actions.length;

                return actions[newIndex] ?? actions[0];
            });
        },
        onFocusRight: () => {
            const { setFocusedAction, focusedItemAdditionalActions } = depsRef.current;

            setFocusedAction((currentAction) => {
                const actions = [SELECT_ITEM_ACTION, ...focusedItemAdditionalActions] satisfies Array<
                    typeof currentAction
                >;

                const currentActionIndex = actions.indexOf(currentAction);
                const newIndex = (actions.length + currentActionIndex + 1) % actions.length;

                return actions[newIndex] ?? actions[0];
            });
        },
        onFocusFirst: () => {},
        onFocusLast: () => {},
        onSelect: (e) => {
            const { actionHandlers, focusedItem, focusedAction } = depsRef.current;

            if (!focusedItem) {
                return;
            }

            actionHandlers[focusedAction](focusedItem, e)?.();
        },
    });
}

function makeItemSelectionNavigation<Item, Action extends string>(
    depsRef: MutableRefObject<IKeyboardNavigationDeps<Item, Action>>,
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
    depsRef: MutableRefObject<IKeyboardNavigationDeps<Item, Action>>,
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
