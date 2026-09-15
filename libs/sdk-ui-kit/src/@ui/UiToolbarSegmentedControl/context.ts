// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, createContext } from "react";

/**
 * @internal
 */
export type UiToolbarSegmentedControlChangeEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>;

export interface IUiToolbarSegmentedControlContextValue {
    value: string | undefined;
    onChange: (value: string, event: UiToolbarSegmentedControlChangeEvent) => void;
    isDisabled: boolean;
}

export const UiToolbarSegmentedControlContext = createContext<IUiToolbarSegmentedControlContextValue | null>(
    null,
);
