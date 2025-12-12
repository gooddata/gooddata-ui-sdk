// (C) 2025 GoodData Corporation

import { type KeyboardEvent } from "react";

/**
 * Checks if the given keyboard event is an action key = Enter or Space.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event is an action key, `false` otherwise.
 *
 * @internal
 */
export const isActionKey = (event: KeyboardEvent): boolean => {
    return event.key === "Enter" || event.key === " ";
};

/**
 * Checks if the given keyboard event is triggered by a Space key.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by a Space key, `false` otherwise.
 *
 * @internal
 */
export const isSpaceKey = (event: KeyboardEvent): boolean => {
    return event.key === " ";
};

/**
 * Checks if the given keyboard event is triggered by an Enter key.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by an Enter key, `false` otherwise.
 *
 * @internal
 */
export const isEnterKey = (event: KeyboardEvent): boolean => {
    return event.key === "Enter";
};

/**
 * Checks if the given keyboard event is triggered by one of the Arrow keys.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by one of the Arrow keys, `false` otherwise.
 *
 * @internal
 */
export const isArrowKey = (event: KeyboardEvent): boolean => {
    return event.key.startsWith("Arrow");
};

/**
 * Checks if the given keyboard event is triggered by a key used for typing.
 * E.g. a letter, a number, arrow keys, home, end, etc.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by a key used for typing, `false` otherwise.
 *
 * @internal
 */
export const isTypingKey = (event: KeyboardEvent): boolean => {
    return (
        event.key.length === 1 ||
        isArrowKey(event) ||
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "Home" ||
        event.key === "End"
    );
};

/**
 * Checks if the given keyboard event is triggered by an Escape key.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by an Escape key, `false` otherwise.
 *
 * @internal
 */
export const isEscapeKey = (event: KeyboardEvent): boolean => {
    return event.key === "Escape";
};

/**
 * Checks if the given keyboard event is triggered by a Copy key.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by ctrl+c or cmd+c, `false` otherwise.
 *
 * @internal
 */
export const isCopyKey = (event: KeyboardEvent): boolean => {
    return event.key === "c" && (event.ctrlKey || event.metaKey);
};

/**
 * Checks if the given keyboard event is triggered by an Tab key.
 *
 * @param event - The keyboard event to check.
 * @returns `true` if the event has been triggered by an Tab key, `false` otherwise.
 *
 * @internal
 */
export const isTabKey = (event: KeyboardEvent): boolean => {
    return event.key === "Tab";
};
