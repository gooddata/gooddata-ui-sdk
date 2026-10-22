// (C) 2026 GoodData Corporation

import { Children, Fragment, type ReactNode, isValidElement, useId, useState } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { matchesSearchQuery } from "../@utils/matchesSearchQuery.js";
import { UiDropdown } from "../UiDropdown/UiDropdown.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { type IUiListboxInteractiveItem, type IUiListboxItem } from "../UiListbox/types.js";
import { getNextFocusableItemId } from "../UiListbox/UiListbox.js";

import { e } from "./searchableSelectBem.js";
import { UiSearchableSelectContext } from "./UiSearchableSelectContext.js";
import { UiSearchableSelectDivider } from "./UiSearchableSelectDivider.js";
import { getUiSearchableSelectItemDescriptor } from "./UiSearchableSelectItem.js";
import { findUiSearchableSelectListRenderItem } from "./UiSearchableSelectList.js";

const BODY_WIDTH = 300;

/**
 * @internal
 */
export interface IUiSearchableSelectProps<T> {
    accessibilityConfig: IAccessibilityConfigBase;
    children: ReactNode;
    /**
     * Whether the dropdown is open when it mounts (uncontrolled, like `defaultOpen` in React Aria).
     * Defaults to `false`.
     */
    defaultOpen?: boolean;
    /**
     * Whether an item matches the search query. Defaults to the item's title containing the query. Called only
     * while searching: without a query, all items show.
     */
    filter?: (item: T, query: string) => boolean;
    items: T[];
    onChange: (value: string) => void;
    placeholder: string;
    value: string | null;
}

/**
 * @internal
 */
export function UiSearchableSelect<T>({
    accessibilityConfig,
    children,
    items,
    filter,
    placeholder,
    defaultOpen = false,
    value,
    onChange,
}: IUiSearchableSelectProps<T>) {
    const buttonId = useId();
    // the button's name is its value followed by its label ("Item 12 Language"), like in React Aria's Select
    const valueId = useId();
    // shared, so that the search can point at the highlighted option (aria-activedescendant)
    const listboxId = useId();
    const [query, setQuery] = useState("");

    // built here, where the items are typed, also to show the selected item while the list is not rendered
    const renderItem = findUiSearchableSelectListRenderItem(children);
    // one group per item: the item and the dividers rendered with it
    const listboxItemGroups = items.map((item): IUiListboxItem<T>[] =>
        renderItem ? getListboxItems(renderItem(item), item) : [],
    );
    const selectedItem = listboxItemGroups
        .flat()
        .find(
            (item): item is IUiListboxInteractiveItem<T> => item.type === "interactive" && item.id === value,
        );
    const filterListboxItems = (searchQuery: string) =>
        listboxItemGroups
            .filter(
                (group) =>
                    !searchQuery ||
                    group.some(
                        (item) =>
                            item.type === "interactive" &&
                            (filter
                                ? filter(item.data, searchQuery)
                                : matchesSearchQuery(item.stringTitle, searchQuery)),
                    ),
            )
            .flat();
    const filteredListboxItems = filterListboxItems(query);
    // the highlight the search moves and the list shows; each opening starts on the selected item
    const [focusedItemId, setFocusedItemId] = useState(value);
    // the highlight shows right away, but the search points at it only after the first arrow key or hover, so
    // that screen readers announce the search on open (see the tests)
    const [isActiveDescendantShown, setIsActiveDescendantShown] = useState(false);
    // while searching, the highlight moves to the first match, like in React Aria; without a query, it goes
    // back to the selected item
    const changeQuery = (nextQuery: string) => {
        setQuery(nextQuery);
        setFocusedItemId(
            nextQuery
                ? getNextFocusableItemId({
                      items: filterListboxItems(nextQuery),
                      focusedItemId: null,
                      direction: "down",
                  })
                : value,
        );
    };

    return (
        <UiDropdown
            width={BODY_WIDTH}
            fullWidthButton
            autofocusOnOpen
            // like a native <select>, tab closes the popup and moves on from the button: the tab out focuses
            // the button (returnFocusTo) before the browser moves the focus
            enableFocusTrap={false}
            returnFocusTo={buttonId}
            offset={4}
            openOnInit={defaultOpen}
            accessibilityConfig={{ popupRole: "listbox" }}
            // a new opening starts with all items, like TimezoneSelect
            onOpen={() => {
                setFocusedItemId(value);
                setIsActiveDescendantShown(false);
            }}
            onClose={() => setQuery("")}
            renderButton={({ ref, isOpen, toggleDropdown, ariaAttributes }) => (
                <button
                    className={e("button")}
                    // UiDropdown types its ref as RefObject<HTMLElement>, which a <button> doesn't accept;
                    // a callback ref assigns the mounted button to it without a cast
                    ref={(button) => {
                        if (button) {
                            ref.current = button;
                        }
                    }}
                    type="button"
                    onClick={toggleDropdown}
                    {...ariaAttributes}
                    {...accessibilityConfigToAttributes(accessibilityConfig)}
                    id={buttonId}
                    aria-controls={isOpen ? listboxId : undefined}
                    // Normally if both aria-label and button text is applied, it the screen read announces only the label. Make sure that is not the case.
                    aria-labelledby={`${valueId} ${accessibilityConfig.ariaLabelledBy ?? buttonId}`}
                >
                    <span id={valueId} className={e("button-title")}>
                        {selectedItem?.stringTitle ?? placeholder}
                    </span>
                    <div className={e("button-icon")}>
                        <UiIcon type={isOpen ? "navigateUp" : "navigateDown"} size={14} disableAnimation />
                    </div>
                </button>
            )}
            renderBody={({ ariaAttributes, closeDropdown }) => (
                <UiSearchableSelectContext.Provider
                    value={{
                        listboxItems: filteredListboxItems,
                        query,
                        setQuery: changeQuery,
                        buttonId,
                        listboxId,
                        focusedItemId,
                        setFocusedItemId,
                        isActiveDescendantShown,
                        setIsActiveDescendantShown,
                        value,
                        onChange,
                        closeDropdown,
                    }}
                >
                    <div className={e("body")} {...ariaAttributes}>
                        {children}
                    </div>
                </UiSearchableSelectContext.Provider>
            )}
        />
    );
}

/**
 * Reads what the item render function returned: an item alone, or an item in a fragment with dividers
 * (`<><UiSearchableSelectItem … /><UiSearchableSelectDivider /></>`), in the order they were written.
 */
function getListboxItems<T>(node: ReactNode, data: T): IUiListboxItem<T>[] {
    const nodes =
        isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment
            ? Children.toArray(node.props.children)
            : [node];
    const listboxItems = nodes.flatMap((child): IUiListboxItem<T>[] => {
        const descriptor = getUiSearchableSelectItemDescriptor(child);
        if (descriptor) {
            return [{ type: "interactive", ...descriptor, data }];
        }
        return isValidElement(child) && child.type === UiSearchableSelectDivider
            ? [{ type: "separator" }]
            : [];
    });

    // dividers belong to an item, so without exactly one item there is nothing to show
    return listboxItems.filter((item) => item.type === "interactive").length === 1 ? listboxItems : [];
}
