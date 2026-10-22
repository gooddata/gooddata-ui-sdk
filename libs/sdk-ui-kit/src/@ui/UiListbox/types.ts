// (C) 2025-2026 GoodData Corporation

import {
    type ComponentType,
    type Dispatch,
    type KeyboardEvent,
    type MouseEvent,
    type MutableRefObject,
    type ReactNode,
    type RefObject,
    type SetStateAction,
} from "react";

import { type IDropdownBodyRenderProps } from "../../Dropdown/Dropdown.js";
import { type IconType } from "../@types/icon.js";
import { type IUiMenuSeparatorItem } from "../UiMenu/types.js";

/**
 * @internal
 */
export interface IUiListboxStaticItem<T> {
    type: "static";
    id?: string;
    data: T;
}

/**
 * @internal
 */
export interface IUiListboxInteractiveItem<T> {
    type: "interactive";
    id: string;
    stringTitle: string;
    icon?: IconType;
    isDisabled?: boolean;
    data: T;
    /**
     * Explanation shown in a tooltip next to the title. Also read by screen readers.
     */
    tooltip?: string;
    /**
     * Rich content rendered in the visual tooltip instead of `tooltip`, e.g. text with a link.
     * `tooltip` still provides the plain text for screen readers.
     */
    tooltipContent?: ReactNode;
    /**
     * The language of the title when it differs from the page, rendered as the option's `lang` attribute.
     */
    lang?: string;
}

/**
 * @internal
 */
export type IUiListboxSeparatorItem = IUiMenuSeparatorItem;

/**
 * @internal
 */
export type IUiListboxItem<InteractiveItemData, StaticItemData = ReactNode> =
    | IUiListboxStaticItem<StaticItemData>
    | IUiListboxSeparatorItem
    | IUiListboxInteractiveItem<InteractiveItemData>;

/**
 * @internal
 */
export interface IUiListboxInteractiveItemProps<T> {
    item: IUiListboxInteractiveItem<T>;

    isFocused: boolean;
    isSelected: boolean;
    isCompact: boolean;

    onSelect: (e: MouseEvent) => void;
}

/**
 * @internal
 */
export interface IUiListboxStaticItemProps<T> {
    item: IUiListboxStaticItem<T>;
}

/**
 * @internal
 */
export interface IUiListboxContext<InteractiveItemData, StaticItemData = ReactNode> {
    items: IUiListboxItem<InteractiveItemData, StaticItemData>[];
    itemRefs: MutableRefObject<(HTMLLIElement | null)[]>;
    onSelect: (
        item: IUiListboxInteractiveItem<InteractiveItemData>,
        mods: { newTab?: boolean; type?: "mouse" | "keyboard" },
    ) => void;
    onClose?: () => void;
    selectedItemId: string | undefined;
    focusedIndex: number | undefined;
    setFocusedIndex: Dispatch<SetStateAction<number | undefined>>;
    isItemFocusable: (item: IUiListboxItem<InteractiveItemData, StaticItemData>) => boolean;
}

/**
 * @internal
 */
export type UiListboxAriaAttributes = Omit<IDropdownBodyRenderProps["ariaAttributes"], "role"> & {
    "aria-controls"?: string;
};

/**
 * @internal
 */
export type UiListboxView = "mobile" | "desktop";

/**
 * @internal
 */
export interface IUiListboxProps<InteractiveItemData, StaticItemData = ReactNode> {
    items: IUiListboxItem<InteractiveItemData, StaticItemData>[];

    dataTestId?: string;
    itemDataTestId?:
        | string
        | ((
              item: IUiListboxStaticItem<StaticItemData> | IUiListboxInteractiveItem<InteractiveItemData>,
          ) => string | undefined);

    width?: number;
    maxWidth?: number;
    maxHeight?: number;

    onSelect?: (
        item: IUiListboxInteractiveItem<InteractiveItemData>,
        mods: {
            type?: "mouse" | "keyboard";
            newTab?: boolean;
        },
    ) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (
        event: KeyboardEvent,
        context: IUiListboxContext<InteractiveItemData, StaticItemData>,
    ) => void;

    selectedItemId?: string;

    InteractiveItemComponent?: ComponentType<IUiListboxInteractiveItemProps<InteractiveItemData>>;
    StaticItemComponent?: ComponentType<IUiListboxStaticItemProps<StaticItemData>>;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    /**
     * Selects an item on a click anywhere in its option (`<li role="option">`), including the option element
     * itself, so that clicks dispatched on the option (tests, assistive technologies) select it too. The listbox
     * handles the click; the `onSelect` passed to `InteractiveItemComponent` then does nothing, so item
     * components that still attach it don't select twice. Controls nested in an option (buttons, links) select
     * the item too unless they stop the click from propagating.
     *
     * Defaults to `false`: the item component attaches `onSelect` itself.
     */
    shouldSelectOnOptionClick?: boolean;
    isDisabledFocusable?: boolean;
    /**
     * The following option enables highlighting items by parent (such as when pressing arrow down and arrow up).
     * Listbox manages (real) focus itself only if the list is focused also. Sometimes though, we need for real focus
     * to stay at a different place (like a search bar above the list), but still have the ability to highlight elements
     * using "virtual focus" and aria attributes like `aria-activedescendant` on the element outside of listbox component.
     */
    focusedItemId?: string | null;
    /**
     * When using virtual focus (`focusedItemId`), there can be a double highlight if the arrow keys and hover
     * are used at the same time. Reports the id of the hovered item, so that the parent can resolve the double
     * highlight.
     */
    onFocusedItemIdChange?: (itemId: string) => void;
    isCompact?: boolean;
    /**
     * Vertical padding of the list: `"default"` is `6px 0`, `"none"` lets the surrounding popup own the spacing.
     * Defaults to `"default"`.
     */
    padding?: "default" | "none";
    supportedViews?: UiListboxView[];

    ariaAttributes: UiListboxAriaAttributes;

    reference?: RefObject<HTMLUListElement | null>;
}
