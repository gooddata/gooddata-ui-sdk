// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type ModifierKey } from "react";

/**
 * @internal
 */
export interface IHandleActionOptions {
    shouldPreventDefault?: boolean;
    shouldStopPropagation?: boolean;
}

const handleAction = <T extends KeyboardEvent = KeyboardEvent>(
    event: T,
    action?: (e: T) => void,
    { shouldPreventDefault = true, shouldStopPropagation = true }: IHandleActionOptions = {},
) => {
    if (!action) {
        return;
    }

    if (shouldPreventDefault) {
        event.preventDefault();
    }
    if (shouldStopPropagation) {
        event.stopPropagation();
    }

    action(event);
};

/**
 * @internal
 */
export const modifierNegator = "!" as const;
/**
 * @internal
 */
export type IModifier = ModifierKey | `${typeof modifierNegator}${ModifierKey}`;

/**
 * @internal
 */
export const makeKeyboardNavigation =
    <ActionKeysMap extends { [action: string]: Array<{ code: string | string[]; modifiers?: IModifier[] }> }>(
        actionKeysMap: ActionKeysMap,
    ) =>
    <T extends KeyboardEvent = KeyboardEvent>(
        handlers: { [action in keyof ActionKeysMap | "onUnhandledKeyDown"]?: (event: T) => void },
        options: IHandleActionOptions = {},
    ) => {
        return (event: T) => {
            const actionName: keyof ActionKeysMap | undefined = Object.entries(actionKeysMap).find(
                ([, keySpecs]) =>
                    keySpecs.some((spec) => {
                        if (
                            (typeof spec.code === "string" && spec.code !== event.code) ||
                            (Array.isArray(spec.code) && !spec.code.includes(event.code))
                        ) {
                            return false;
                        }

                        if (!spec.modifiers) {
                            return true;
                        }

                        return spec.modifiers.every((fullModifier) => {
                            const shouldBePressed = !fullModifier.startsWith(modifierNegator);
                            const modifier = shouldBePressed
                                ? fullModifier
                                : fullModifier.substring(modifierNegator.length);

                            return event.getModifierState(modifier as ModifierKey) === shouldBePressed;
                        });
                    }),
            )?.[0];

            const actionHandler = actionName === undefined ? undefined : handlers[actionName];

            if (!actionHandler) {
                handlers.onUnhandledKeyDown?.(event);
                return;
            }

            handleAction(event, actionHandler, options);
        };
    };

/**
 * @internal
 */
export const makeMenuKeyboardNavigation = makeKeyboardNavigation({
    onFocusPrevious: [{ code: "ArrowUp" }],
    onFocusNext: [{ code: "ArrowDown" }],
    onFocusFirst: [{ code: "Home" }],
    onFocusLast: [{ code: "End" }],
    onEnterLevel: [{ code: ["ArrowRight", "F2"] }],
    onLeaveLevel: [{ code: "ArrowLeft" }],
    onSelect: [{ code: ["Enter", "Space"] }],
    onClose: [{ code: "Escape" }],
});

/**
 * @internal
 */
export const makeGridKeyboardNavigation = makeKeyboardNavigation({
    onFocusUp: [{ code: "ArrowUp" }],
    onFocusDown: [{ code: "ArrowDown" }],
    onFocusFirst: [{ code: "Home" }],
    onFocusLast: [{ code: "End" }],
    onFocusRight: [{ code: "ArrowRight" }],
    onFocusLeft: [{ code: "ArrowLeft" }],
    onSelect: [{ code: ["Enter", "Space"] }],
});

/**
 * @internal
 */
export const makeLinearKeyboardNavigation = makeKeyboardNavigation({
    onFocusPrevious: [{ code: ["ArrowUp", "ArrowLeft"] }],
    onFocusNext: [{ code: ["ArrowDown", "ArrowRight"] }],
    onFocusFirst: [{ code: "Home" }],
    onFocusLast: [{ code: "End" }],
    onSelect: [{ code: ["Enter", "Space"] }],
    onClose: [{ code: "Escape" }],
});

/**
 * @internal
 */
export const makeDialogKeyboardNavigation = makeKeyboardNavigation({
    onFocusNext: [{ code: "Tab", modifiers: ["!Shift"] }],
    onFocusPrevious: [{ code: "Tab", modifiers: ["Shift"] }],
    onClose: [{ code: "Escape" }],
});

/**
 * @internal
 */
export const makeTabsKeyboardNavigation = makeKeyboardNavigation({
    onFocusPrevious: [{ code: ["ArrowUp", "ArrowLeft"] }],
    onFocusNext: [{ code: ["ArrowDown", "ArrowRight"] }],
    onFocusFirst: [{ code: "Home" }],
    onFocusLast: [{ code: "End" }],
    onSelect: [{ code: ["Enter", "Space"] }],
});

/**
 * @internal
 */
export const makeHorizontalKeyboardNavigation = makeKeyboardNavigation({
    onFocusPrevious: [{ code: ["ArrowLeft"] }],
    onFocusNext: [{ code: ["ArrowRight"] }],
    onFocusFirst: [{ code: "Home" }],
    onFocusLast: [{ code: "End" }],
});

/**
 * @internal
 */
export const makeLinearKeyboardNavigationWithConfirm = makeKeyboardNavigation({
    onFocusPrevious: [{ code: ["ArrowUp", "ArrowLeft"] }],
    onFocusNext: [{ code: ["ArrowDown", "ArrowRight"] }],
    onFocusFirst: [{ code: "Home" }],
    onFocusLast: [{ code: "End" }],
    onSelect: [{ code: "Space" }],
    onConfirm: [{ code: "Enter" }],
    onClose: [{ code: "Escape" }],
});
